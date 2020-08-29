'use strict'

const json = require('json-pointer')

function getDefaultPropertyType ({
  propertyNameAsType, capitalizeProperty, defaultPropertyType
}, property) {
  const fallbackPropertyType = '*'

  if (property !== undefined && propertyNameAsType) {
    return capitalizeProperty ? upperFirst(property) : property
  }
  if (defaultPropertyType === null || defaultPropertyType === '') {
    return defaultPropertyType
  }
  return defaultPropertyType || fallbackPropertyType
}

function wrapDescription (config, description) {
  const { maxLength } = config
  if (!maxLength) {
    return [description]
  }
  const result = []

  while (true) {
    const excess = description.length - config.indentMaxDelta
    if (excess <= 0) {
      if (description) {
        result.push(description)
      }
      break
    }
    const maxLine = description.slice(0, config.indentMaxDelta)
    const wsIndex = maxLine.search(/\s\S*$/)
    let safeString
    if (wsIndex === -1) {
      // With this being all non-whitespace, e.g., a long link, we
      //  let it go on without wrapping until whitespace is reached
      const remainder = description.slice(config.indentMaxDelta).match(/^\S+/)
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

  const config = parseOptions(options)

  jsdoc.push(...writeDescription(schema, config))

  if (json.has(schema, '/properties')) {
    jsdoc.push(...processProperties(schema, schema, null, config))
  }
  if (json.has(schema, '/items')) {
    jsdoc.push(...processItems(schema, schema, null, config))
  }

  return format(config.outerIndent, jsdoc)
}

function parseOptions (options) {
  const asteriskAndWhitespaceLength = 3 // ' * '
  const outerIndent = (options.indentChar || ' ').repeat(options.indent || 0)
  const indentMaxDelta = options.maxLength - outerIndent.length -
    asteriskAndWhitespaceLength

  return {
    ...options,
    outerIndent,
    indentMaxDelta
  }
}

function processItems (schema, rootSchema, base, config) {
  const items = json.get(schema, '/items')
  if (!Array.isArray(items)) {
    return []
  }
  const result = []
  items.forEach((item, i) => {
    const root = base ? `${base}.` : ''
    const prefixedProperty = root + i
    const defaultValue = item.default
    const optional = !schema.minItems || i >= schema.minItems
    if (item.type === 'array' && item.items) {
      result.push(...writeProperty('array', prefixedProperty, item.description, optional, defaultValue, config))
      result.push(...processItems(item, rootSchema, prefixedProperty, config))
    } else if (item.type === 'object' && item.properties) {
      result.push(...writeProperty('object', prefixedProperty, item.description, optional, defaultValue, config))
      result.push(...processProperties(item, rootSchema, prefixedProperty, config))
    } else {
      const type = getType(item, rootSchema) || getDefaultPropertyType(config)
      result.push(...writeProperty(type, prefixedProperty, item.description, optional, defaultValue, config))
    }
  })
  return result
}

function processProperties (schema, rootSchema, base, config) {
  const props = json.get(schema, '/properties')
  const required = json.has(schema, '/required') ? json.get(schema, '/required') : []
  const result = []

  for (const property in props) {
    if (Array.isArray(config.ignore) && config.ignore.includes(property)) {
      continue
    } else {
      const prop = props[property]
      const root = base ? `${base}.` : ''
      const prefixedProperty = root + property
      const defaultValue = props[property].default
      const optional = !required.includes(property)
      if (prop.type === 'object' && prop.properties) {
        result.push(...writeProperty('object', prefixedProperty, prop.description, optional, defaultValue, config))
        result.push(...processProperties(prop, rootSchema, prefixedProperty, config))
      } else if (prop.type === 'array' && prop.items) {
        result.push(...writeProperty('array', prefixedProperty, prop.description, optional, defaultValue, config))
        result.push(...processItems(prop, rootSchema, prefixedProperty, config))
      } else {
        const type = getType(prop, rootSchema) || getDefaultPropertyType(config, property)
        result.push(...writeProperty(type, prefixedProperty, prop.description, optional, defaultValue, config))
      }
    }
  }
  return result
}

function writeDescription (schema, config) {
  const result = []
  const { objectTagName = 'typedef' } = config
  let { description } = schema
  if (description === undefined) {
    description = config.autoDescribe ? generateDescription(schema.title, schema.type) : ''
  }
  const typeMatch = config.types && config.types[schema.type]

  let type
  if (config.types === null) {
    type = ''
  } else {
    type = ` {${
      typeMatch === ''
        ? ''
        : typeMatch || getType(schema, schema)
      }}`
  }

  if (description || config.addDescriptionLineBreak) {
    result.push(...wrapDescription(config, description))
  }

  const namepath = schema.title ? ` ${config.capitalizeTitle ? upperFirst(schema.title) : schema.title}` : ''
  result.push(`@${objectTagName}${type}${namepath}`)

  return result
}

function writeProperty (type, field, description = '', optional, defaultValue, config) {
  let fieldTemplate
  if (optional) {
    fieldTemplate = `[${field}${defaultValue === undefined ? '' : `=${JSON.stringify(defaultValue)}`}]`
  } else {
    fieldTemplate = field
  }

  let desc
  if (!description && !config.descriptionPlaceholder) {
    desc = ''
  } else if (config.hyphenatedDescriptions) {
    desc = ` - ${description}`
  } else {
    desc = ` ${description}`
  }
  const typeExpression = type === null ? '' : `{${type}} `
  return wrapDescription(config, `@property ${typeExpression}${fieldTemplate}${desc}`)
}

function getType (schema, rootSchema) {
  if (schema.$ref) {
    const ref = json.get(rootSchema, schema.$ref.slice(1))
    return getType(ref, rootSchema)
  }

  if (schema.enum) {
    if (schema.type === 'string') {
      return `"${schema.enum.join('"|"')}"`
    }
    if (
      schema.type === 'number' || schema.type === 'integer' ||
      schema.type === 'boolean'
    ) {
      return `${schema.enum.join('|')}`
    }

    return schema.type === 'null' ? 'null' : 'enum'
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
