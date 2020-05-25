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
  jsdoc += writeDescription(schema)

  if (!json.has(schema, '/properties')) {
    return jsdoc
  }

  jsdoc += processProperties(schema, schema, false, options)

  jsdoc += '  */\n'

  return jsdoc
}

function processProperties (schema, rootSchema, nested, options = {}) {
  const props = json.get(schema, '/properties')
  const required = json.has(schema, '/required') ? json.get(schema, '/required') : []

  let text = ''
  for (const property in props) {
    if (Array.isArray(options.ignore) && options.ignore.includes(property)) {
      continue
    } else {
      const prefix = nested ? '.' : ''

      if (props[property].type === 'object' && props[property].properties) {
        text += writeParam('object', prefix + property, props[property].description, true)
        text += processProperties(props[property], rootSchema, true)
      } else {
        const optional = !required.includes(property)
        const type = getType(props[property], rootSchema) || upperFirst(property)
        text += writeParam(type, prefix + property, props[property].description, optional)
      }
    }
  }
  return text
}

function writeDescription (schema) {
  return `  * ${
    schema.description || `Represents a ${schema.id} object`
}
  * @name ${upperFirst(schema.id)}
  *
`
}

function writeParam (type, field, description = '', optional) {
  const fieldTemplate = optional ? `[${field}]` : field
  return `  * @property {${type}} ${fieldTemplate} - ${description} \n`
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

function upperFirst (str = '') {
  return str.slice(0, 1).toUpperCase() + str.slice(1)
}
