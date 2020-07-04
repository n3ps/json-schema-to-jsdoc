'use strict'

const json = require('json-pointer')

const defaultPropertyType = '*'
function getDefaultPropertyType (options, property) {
  if (property !== undefined && options.propertyNameAsType) {
    return options.capitalizeProperty ? upperFirst(property) : property
  }
  if (options.defaultPropertyType === false) {
    return null
  }
  return options.defaultPropertyType || defaultPropertyType
}

module.exports = generate

function generate (schema, options = {}) {
  const jsdoc = []

  if (!schema || Object.keys(schema).length === 0) {
    return ''
  }

  jsdoc.push(...writeDescription(schema, options))

  if (json.has(schema, '/properties')) {
    jsdoc.push(...processProperties(schema, schema, null, options))
  }
  if (json.has(schema, '/items')) {
    jsdoc.push(...processItems(schema, schema, null, options))
  }

  return format(jsdoc, options)
}

function indent (options) {
  return (options.indentChar || ' ').repeat(options.indent || 0)
}

function processItems (schema, rootSchema, base, options) {
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
      result.push(writeProperty('array', prefixedProperty, item.description, false, defaultValue, options))
      result.push(...processItems(item, rootSchema, prefixedProperty, options))
    } else if (item.type === 'object' && item.properties) {
      result.push(writeProperty('object', prefixedProperty, item.description, false, defaultValue, options))
      result.push(...processProperties(item, rootSchema, prefixedProperty, options))
    } else {
      const type = getType(item, rootSchema) || getDefaultPropertyType(options)
      result.push(writeProperty(type, prefixedProperty, item.description, false, defaultValue, options))
    }
  })
  return result
}

function processProperties (schema, rootSchema, base, options) {
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
        result.push(writeProperty('object', prefixedProperty, prop.description, true, defaultValue, options))
        result.push(...processProperties(prop, rootSchema, prefixedProperty, options))
      } else if (prop.type === 'array' && prop.items) {
        result.push(writeProperty('array', prefixedProperty, prop.description, true, defaultValue, options))
        result.push(...processItems(prop, rootSchema, prefixedProperty, options))
      } else {
        const optional = !required.includes(property)
        const type = getType(prop, rootSchema) || getDefaultPropertyType(options, property)
        result.push(writeProperty(type, prefixedProperty, prop.description, optional, defaultValue, options))
      }
    }
  }
  return result
}

function writeDescription (schema, options) {
  const result = []
  let { description } = schema
  if (description === undefined) {
    description = options.autoDescribe ? generateDescription(schema.title, schema.type) : ''
  }
  const typeMatch = options.types && options.types[schema.type]

  let type
  if (options.types === false) {
    type = ''
  } else {
    type = ` {${
      typeMatch === ''
        ? ''
        : typeMatch || schema.type
      }}`
  }

  if (description || options.addDescriptionLineBreak) {
    result.push(description)
  }

  const namepath = schema.title ? ` ${options.capitalizeTitle ? upperFirst(schema.title) : schema.title}` : ''
  result.push(`@${options.objectTagName || 'typedef'}${type}${namepath}`)

  return result
}

function writeProperty (type, field, description = '', optional, defaultValue, options) {
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
  return `@property ${typeExpression}${fieldTemplate}${desc}`
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

function format (lines, options) {
  const prefix = indent(options)
  const result = [`${prefix}/**`]

  result.push(...lines.map(line => line ? `${prefix} * ${line}` : ' *'))
  result.push(`${prefix} */\n`)

  return result.join('\n')
}
