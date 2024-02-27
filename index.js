'use strict'

const json = require('json-pointer')
const NewBlockIndicator = 1
let generatedDefs = []

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

  let defs
  if (json.has(schema, '/definitions')) {
    defs = json.get(schema, '/definitions')
  } else if (json.has(schema, '/$defs')) {
    defs = json.get(schema, '/$defs')
  }

  const required = json.has(schema, '/required') ? json.get(schema, '/required') : []

  jsdoc.push(...writeDescription(schema, schema, config))
  jsdoc.push(...processObject(schema, '', '', required, schema, config, true))
  jsdoc.push(...processDefinitions(defs, schema, null, config))
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
      result.push(...writeProperty('array', prefixedProperty, item.description, optional, defaultValue, schema, rootSchema, config))
      result.push(...processItems(item, rootSchema, prefixedProperty, config))
    } else if (item.type === 'object' && item.properties) {
      result.push(...writeProperty('object', prefixedProperty, item.description, optional, defaultValue, schema, rootSchema, config))
      result.push(...processProperties(item, rootSchema, prefixedProperty, config))
    } else {
      const type = getSchemaType(item, rootSchema) || getDefaultPropertyType(config)
      result.push(...writeProperty(type, prefixedProperty, item.description, optional, defaultValue, item, rootSchema, config))
    }
  })
  return result
}

function processProperties (schema, rootSchema, base, config) {
  if (!json.has(schema, '/properties')) return []
  const props = json.get(schema, '/properties')
  const required = json.has(schema, '/required') ? json.get(schema, '/required') : []
  const result = []

  for (const property in props) {
    if (Array.isArray(config.ignore) && config.ignore.includes(property)) {
      continue
    } else {
      const root = base ? `${base}.` : ''
      const prefixedProperty = root + property
      result.push(...processObject(props[property], property, prefixedProperty, required, rootSchema, config))
    }
  }
  return result
}

function processObject (obj, objName, prefixedProperty, required, rootSchema, config, rootElement) {
  const defaultValue = obj.default
  const result = []
  const optional = !required.includes(objName)

  if (obj.allOf || obj.anyOf) {
    const refs = []
    const refsIsA = []
    const refsAnyOf = []
    const entries = []
    const container = obj.allOf ? obj.allOf : obj.anyOf
    const separator = obj.allOf ? '&' : '|'

    for (const e of container) {
      if (json.has(e, '/$ref')) {
        if (e.classRelation && e.classRelation === 'is-a') {
          refsIsA.push(e)
        } else {
          refs.push(e)
        }
      } else {
        entries.push(e)
      }
    }

    if (obj.anyOf) {
      let count = 0
      for (const e of refs) {
        const refElement = json.get(rootSchema, e.$ref.replace(/^#/gm, ''))
        if (refElement.title) {
          e.title = `${obj.title}_${refElement.title}`
        } else {
          e.title = `${obj.title}_subtype${count}`
          count++
        }
        refsAnyOf.push(e)
        generatedDefs.push(e)
      }
      for (const e of entries) {
        const type = getSchemaType(e, rootSchema, config) || getDefaultPropertyType(config, objName)
        if (type === 'object') {
          if (e.title) {
            e.title = `${obj.title}_${e.title}`
          } else {
            e.title = `${obj.title}_subtype${count}`
            count++
          }
          refsAnyOf.push(e)
          generatedDefs.push(e)
        }
      }
    }

    if (refsIsA.length === 0 && refsAnyOf.length === 0) {
      if (!rootElement) result.push(...writeProperty('object', prefixedProperty, obj.description, optional, defaultValue, obj, rootSchema, config))
    } else {
      const optional = !required.includes(objName)
      let type = ''
      for (let i = 0; i < refsIsA.length; i++) {
        if (type !== '') type += separator
        type += getSchemaType(refsIsA[i], rootSchema)
      }
      for (let i = 0; i < refsAnyOf.length; i++) {
        if (type !== '') type += separator
        type += refsAnyOf[i].title
      }
      if (type === '') type = getDefaultPropertyType(config, objName)
      if (!rootElement) result.push(...writeProperty(type, prefixedProperty, obj.description, optional, defaultValue, obj, rootSchema, config))
    }

    if (obj.allOf) {
      for (const e of refs) {
        result.push(...processProperties(json.get(rootSchema, e.$ref.replace(/^#/gm, '')), rootSchema, prefixedProperty, config))
      }
      for (const e of entries) {
        result.push(...processProperties(e, rootSchema, prefixedProperty, config))
      }
    }
  } else {
    if (obj.$ref) {
      if (obj.classRelation && obj.classRelation === 'is-a') {
        const type = getSchemaType(obj, rootSchema) || getDefaultPropertyType(config, objName)
        if (!rootElement) result.push(...writeProperty(type, prefixedProperty, obj.description, optional, defaultValue, obj, rootSchema, config))
      } else {
        if (!rootElement) result.push(...writeProperty('object', prefixedProperty, obj.description, optional, defaultValue, obj, rootSchema, config))
        result.push(...processProperties(json.get(rootSchema, obj.$ref.slice(1)), rootSchema, prefixedProperty, config))
      }
    } else {
      if (obj.type === 'object' && obj.properties) {
        if (!rootElement) result.push(...writeProperty('object', prefixedProperty, obj.description, optional, defaultValue, obj, rootSchema, config))
        result.push(...processProperties(obj, rootSchema, prefixedProperty, config))
      } else if (obj.type === 'array' && obj.items) {
        if (!rootElement) result.push(...writeProperty('array', prefixedProperty, obj.description, optional, defaultValue, obj, rootSchema, config))
        result.push(...processItems(obj, rootSchema, prefixedProperty, config))
      } else {
        const type = getSchemaType(obj, rootSchema) || getDefaultPropertyType(config, objName)
        if (!rootElement) result.push(...writeProperty(type, prefixedProperty, obj.description, optional, defaultValue, obj, rootSchema, config))
      }
    }
  }

  return result
}

function getSchemaType (schema, rootSchema) {
  if (schema.$ref) {
    const ref = json.get(rootSchema, schema.$ref.slice(1))
    if (schema.classRelation && schema.classRelation === 'is-a') {
      return ref.title
    } else {
      return ref.type
    }
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
    // Enum can represent more complex types such as array or object
    // It can also include a mixture of different types
    // Currently, these scenarios are not handled
    return schema.type === 'null' ? 'null' : 'enum'
  }

  if (schema.const !== undefined) {
    if (schema.type === 'string') {
      return `"${schema.const}"`
    }
    if (
      schema.type === 'number' || schema.type === 'integer' ||
      schema.type === 'boolean'
    ) {
      return `${schema.const}`
    }
    // Const can also be of more complex types like arrays or objects
    // As of now, these cases are not addressed
    return schema.type === 'null' ? 'null' : 'const'
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

function getType (schema, rootSchema, config, type) {
  const typeCheck = type || schema.type
  let typeMatch
  if (schema.format) {
    typeMatch = config.formats && config.formats[schema.format] &&
      config.formats[schema.format][typeCheck]
  }
  if (typeMatch === undefined || typeMatch === null) {
    typeMatch = config.types && config.types[typeCheck]
  }

  let typeStr
  if (config.types === null || config.formats === null ||
    (config.formats && (
      (config.formats[schema.format] === null) ||
      (config.formats[schema.format] &&
        config.formats[schema.format][typeCheck] === null)
    )) ||
    (typeMatch !== '' && !typeMatch && (type === null || type === ''))
  ) {
    typeStr = ''
  } else {
    typeStr = ` {${
      typeMatch === ''
        ? ''
        : typeMatch || type || getSchemaType(schema, rootSchema)
      }}`
  }

  return typeStr
}

function processDefinitions (defs, rootSchema, base, config) {
  const result = []

  for (const def in defs) {
    result.push(...writeDefinition(defs[def], rootSchema, config))
  }
  for (const def of generatedDefs) {
    if (def.$ref) {
      const edit = { ...json.get(rootSchema, def.$ref.replace(/^#/gm, '')) }
      edit.title = def.title
      result.push(...writeDefinition(edit, rootSchema, config))
    } else {
      result.push(...writeDefinition(def, rootSchema, config))
    }
  }

  generatedDefs = []

  return result
}

function writeDefinition (def, rootSchema, config) {
  const result = []
  result.push(NewBlockIndicator)
  result.push(...writeDescription(def, rootSchema, config))
  if (def.type === 'object') {
    if (json.has(def, '/properties')) {
      result.push(...processProperties(def, rootSchema, null, config))
    }
    if (json.has(def, '/items')) {
      result.push(...processItems(def, rootSchema, null, config))
    }
  }
  return result
}

function writeDescription (schema, rootSchema, config) {
  const result = []
  const { objectTagName = 'typedef' } = config
  let { description } = schema
  if (description === undefined) {
    description = config.autoDescribe ? generateDescription(schema.title, schema.type) : ''
  }

  const type = getType(schema, rootSchema, config)

  if (description || config.addDescriptionLineBreak) {
    result.push(...wrapDescription(config, description))
  }

  const namepath = schema.title ? ` ${config.capitalizeTitle ? upperFirst(schema.title) : schema.title}` : ''
  result.push(`@${objectTagName}${type}${namepath}`)

  return result
}

function writeProperty (type, field, description = '', optional, defaultValue, schema, rootSchema, config) {
  const typeExpression = getType(schema, rootSchema, config, type)

  let fieldTemplate = ' '
  if (optional) {
    fieldTemplate += `[${field}${defaultValue === undefined ? '' : `=${JSON.stringify(defaultValue)}`}]`
  } else {
    fieldTemplate += field
  }

  let desc
  if (!description && !config.descriptionPlaceholder) {
    desc = ''
  } else if (config.hyphenatedDescriptions) {
    desc = ` - ${description}`
  } else {
    desc = ` ${description}`
  }
  return wrapDescription(config, `@property${typeExpression}${fieldTemplate}${desc}`)
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

  result.push(...lines.map(line => {
    if (line === NewBlockIndicator) {
      return ' */\n\n/**'
    } else {
      return line ? `${outerIndent} * ${line}` : ' *'
    }
  }))
  result.push(`${outerIndent} */\n`)

  return result.join('\n')
}
