'use strict'

const json = require('json-pointer')

const fallbackPropertyType = '*'
function getDefaultPropertyType ({
  propertyNameAsType, capitalizeProperty, defaultPropertyType
}, property) {
  if (property !== undefined && propertyNameAsType) {
    return capitalizeProperty ? upperFirst(property) : property
  }
  if (defaultPropertyType === null || defaultPropertyType === '') {
    return defaultPropertyType
  }
  return defaultPropertyType || fallbackPropertyType
}

function wrapDescription (options, outerIndent, description) {
  const { maxLength } = options
  if (!maxLength) {
    return [description]
  }
  const result = []

  const asteriskAndWhitespaceLength = 3 // ' * '
  const indentMaxDelta = maxLength - outerIndent.length -
    asteriskAndWhitespaceLength

  while (true) {
    const excess = description.length - indentMaxDelta
    if (excess <= 0) {
      if (description) {
        result.push(description)
      }
      break
    }
    const maxLine = description.slice(0, indentMaxDelta)
    const wsIndex = maxLine.search(/\s\S*$/)
    let safeString
    if (wsIndex === -1) {
      // With this being all non-whitespace, e.g., a long link, we
      //  let it go on without wrapping until whitespace is reached
      const remainder = description.slice(indentMaxDelta).match(/^\S+/)
      safeString = maxLine + (remainder || '')
    } else {
      safeString = maxLine.slice(0, wsIndex)
    }
    result.push(safeString)
    description = description.slice(safeString.length + 1)
  }
  return result
}

module.exports = generate

function generate (schema, options = {}) {
  const jsdoc = []

  if (!schema || Object.keys(schema).length === 0) {
    return ''
  }

  const outerIndent = indent(options)
  jsdoc.push(...writeDescription(schema, outerIndent, options))

  if (json.has(schema, '/properties')) {
    jsdoc.push(...processProperties(schema, schema, null, outerIndent, options))
  }
  if (json.has(schema, '/items')) {
    jsdoc.push(...processItems(schema, schema, null, outerIndent, options))
  }

  return format(outerIndent, jsdoc)
}

function indent (options) {
  return (options.indentChar || ' ').repeat(options.indent || 0)
}

function processItems (schema, rootSchema, base, outerIndent, options) {
  const items = json.get(schema, '/items')
  if (!Array.isArray(items)) {
    return []
  }
  const result = []
  items.forEach((item, i) => {
    const root = base ? `${base}.` : ''
    const prefixedProperty = root + i
    const defaultValue = item.default
    if (item.type === 'array' && item.items) {
      result.push(...writeProperty('array', prefixedProperty, outerIndent, item.description, false, defaultValue, options))
      result.push(...processItems(item, rootSchema, prefixedProperty, outerIndent, options))
    } else if (item.type === 'object' && item.properties) {
      result.push(...writeProperty('object', prefixedProperty, outerIndent, item.description, false, defaultValue, options))
      result.push(...processProperties(item, rootSchema, prefixedProperty, outerIndent, options))
    } else {
      const type = getType(item, rootSchema) || getDefaultPropertyType(options)
      result.push(...writeProperty(type, prefixedProperty, outerIndent, item.description, false, defaultValue, options))
    }
  })
  return result
}

function processProperties (schema, rootSchema, base, outerIndent, options) {
  const props = json.get(schema, '/properties')
  const required = json.has(schema, '/required') ? json.get(schema, '/required') : []
  const result = []

  for (const property in props) {
    if (Array.isArray(options.ignore) && options.ignore.includes(property)) {
      continue
    } else {
      const prop = props[property]
      const root = base ? `${base}.` : ''
      const prefixedProperty = root + property
      const defaultValue = props[property].default
      if (prop.type === 'object' && prop.properties) {
        result.push(...writeProperty('object', prefixedProperty, outerIndent, prop.description, true, defaultValue, options))
        result.push(...processProperties(prop, rootSchema, prefixedProperty, outerIndent, options))
      } else if (prop.type === 'array' && prop.items) {
        result.push(...writeProperty('array', prefixedProperty, outerIndent, prop.description, true, defaultValue, options))
        result.push(...processItems(prop, rootSchema, prefixedProperty, outerIndent, options))
      } else {
        const optional = !required.includes(property)
        const type = getType(prop, rootSchema) || getDefaultPropertyType(options, property)
        result.push(...writeProperty(type, prefixedProperty, outerIndent, prop.description, optional, defaultValue, options))
      }
    }
  }
  return result
}

function writeDescription (schema, outerIndent, options) {
  const result = []
  const { objectTagName = 'typedef' } = options
  let { description } = schema
  if (description === undefined) {
    description = options.autoDescribe ? generateDescription(schema.title, schema.type) : ''
  }
  const typeMatch = options.types && options.types[schema.type]

  let type
  if (options.types === null) {
    type = ''
  } else {
    type = ` {${
      typeMatch === ''
        ? ''
        : typeMatch || schema.type
      }}`
  }

  if (description || options.addDescriptionLineBreak) {
    result.push(...wrapDescription(options, outerIndent, description))
  }

  const namepath = schema.title ? ` ${options.capitalizeTitle ? upperFirst(schema.title) : schema.title}` : ''
  result.push(`@${objectTagName}${type}${namepath}`)

  return result
}

function writeProperty (type, field, outerIndent, description = '', optional, defaultValue, options) {
  let fieldTemplate
  if (optional) {
    fieldTemplate = `[${field}${defaultValue === undefined ? '' : `=${JSON.stringify(defaultValue)}`}]`
  } else {
    fieldTemplate = field
  }

  let desc
  if (!description && !options.descriptionPlaceholder) {
    desc = ''
  } else if (options.hyphenatedDescriptions) {
    desc = ` - ${description}`
  } else {
    desc = ` ${description}`
  }
  const typeExpression = type === null ? '' : `{${type}} `
  return wrapDescription(options, outerIndent, `@property ${typeExpression}${fieldTemplate}${desc}`)
}

function getType (schema, rootSchema) {
  if (schema.$ref) {
    const ref = json.get(rootSchema, schema.$ref.slice(1))
    return getType(ref, rootSchema)
  }

  if (schema.enum) {
    return 'enum'
  }

  if (Array.isArray(schema.type)) {
    if (schema.type.includes('null')) {
      return `?${schema.type[0]}`
    } else {
      return schema.type.join('|')
    }
  }

  return schema.type
}

function upperFirst (str) {
  return str.slice(0, 1).toUpperCase() + str.slice(1)
}

function generateDescription (title, type) {
  const noun = title ? `${title} ${type}` : type
  const article = `a${'aeiou'.split('').includes(noun.charAt()) ? 'n' : ''}`

  return `Represents ${article} ${noun}`
}

function format (outerIndent, lines) {
  const result = [`${outerIndent}/**`]

  result.push(...lines.map(line => line ? `${outerIndent} * ${line}` : ' *'))
  result.push(`${outerIndent} */\n`)

  return result.join('\n')
}
