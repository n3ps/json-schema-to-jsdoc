'use strict'

// const fs = require('fs');
const json = require('json-pointer')

module.exports = generate

function generate (schema, options = {}) {
  let jsdoc = ''

  if (!schema || Object.keys(schema).length === 0) {
    return jsdoc
  }

  jsdoc += '/**\n'
  jsdoc += writeDescription(schema, options)

  if (json.has(schema, '/properties')) {
    jsdoc += `  *
`
    jsdoc += processProperties(schema, schema, false, options)
  }

  jsdoc += '  */\n'

  return jsdoc
}

function processProperties (schema, rootSchema, nested, options) {
  const props = json.get(schema, '/properties')
  const required = json.has(schema, '/required') ? json.get(schema, '/required') : []

  let text = ''
  for (const property in props) {
    if (Array.isArray(options.ignore) && options.ignore.includes(property)) {
      continue
    } else {
      const prefix = nested ? '.' : ''

      if (props[property].type === 'object' && props[property].properties) {
        text += writeParam('object', prefix + property, props[property].description, true, options)
        text += processProperties(props[property], rootSchema, true, options)
      } else {
        const optional = !required.includes(property)
        const type = getType(props[property], rootSchema) || upperFirst(property)
        text += writeParam(type, prefix + property, props[property].description, optional, options)
      }
    }
  }
  return text
}

function writeDescription (schema, options) {
  let { description } = schema
  if (description === undefined) {
    description = options.autoDescribe === false ? '' : generateDescription(schema.title, schema.type)
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
  return `  *${description}
  * @${options.objectTagName || 'typedef'}${type}${schema.title
    ? ` ${options.capitalizeTitle === false ? schema.title : upperFirst(schema.title)}`
    : ''
  }
`
}

function writeParam (type, field, description = '', optional, options) {
  const fieldTemplate = optional ? `[${field}]` : field
  let desc
  if (!description && options.descriptionPlaceholder === false) {
    desc = ''
  } else if (options.hyphenatedDescriptions === false) {
    desc = ` ${description}`
  } else {
    desc = ` - ${description}`
  }
  return `  * @property {${type}} ${fieldTemplate}${desc}\n`
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
