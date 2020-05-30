'use strict'

// const fs = require('fs');
const json = require('json-pointer')

module.exports = generate

function generate (schema, options = {}) {
  let jsdoc = ''

  if (!schema || Object.keys(schema).length === 0) {
    return jsdoc
  }

  jsdoc += `${indent(options)}/**\n`
  jsdoc += writeDescription(schema, options)

  if (json.has(schema, '/properties')) {
    jsdoc += processProperties(schema, schema, null, options)
  }

  jsdoc += `${indent(options)} */\n`

  return jsdoc
}

function indent (options) {
  return (options.indentChar || ' ').repeat(options.indent || 0)
}

function processProperties (schema, rootSchema, base, options) {
  const props = json.get(schema, '/properties')
  const required = json.has(schema, '/required') ? json.get(schema, '/required') : []

  let text = ''
  for (const property in props) {
    if (Array.isArray(options.ignore) && options.ignore.includes(property)) {
      continue
    } else {
      const root = base ? `${base}.` : ''
      const prefixedProperty = root + property
      const defaultValue = props[property].default
      if (props[property].type === 'object' && props[property].properties) {
        text += writeProperty('object', prefixedProperty, props[property].description, true, defaultValue, options)
        text += processProperties(props[property], rootSchema, prefixedProperty, options)
      } else {
        const optional = !required.includes(property)
        const type = getType(props[property], rootSchema) || upperFirst(property)
        text += writeProperty(type, prefixedProperty, props[property].description, optional, defaultValue, options)
      }
    }
  }
  return text
}

function writeDescription (schema, options) {
  let { description } = schema
  if (description === undefined) {
    description = options.autoDescribe ? generateDescription(schema.title, schema.type) : ''
  } else {
    description = ` ${description}`
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
  let descriptionLine = ''
  if (description || options.addDescriptionLineBreak) {
    descriptionLine = `${indent(options)} *${description}
`
  }
  return `${descriptionLine}${indent(options)} * @${options.objectTagName || 'typedef'}${type}${schema.title
    ? ` ${options.capitalizeTitle ? upperFirst(schema.title) : schema.title}`
    : ''
  }
`
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
  return `${indent(options)} * @property {${type}} ${fieldTemplate}${desc}\n`
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

  return ` Represents ${article} ${noun}`
}
