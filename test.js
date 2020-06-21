'use strict'

const generate = require('./index')

const trailingSpace = ' '

it('Guards', function () {
  const inputs = [null, {}, undefined]
  inputs.forEach(input => {
    expect(generate(input)).toEqual('')
  })
})

it('Simple string', function () {
  const schema = { type: 'string' }
  const expected = `/**
 * Represents a string
 * @typedef {string}
 */
`
  expect(generate(schema)).toEqual(expected)
})

it('Simple string with description', function () {
  const schema = { type: 'string', description: 'String description' }
  const expected = `/**
 * String description
 * @typedef {string}
 */
`
  expect(generate(schema)).toEqual(expected)
})

it('Simple object with `autoDescribe`: false', function () {
  const schema = {
    type: 'object'
  }
  const expected = `/**
 *
 * @typedef {object}
 */
`
  expect(generate(schema, {
    autoDescribe: false
  })).toEqual(expected)
})

it('Simple object with `emptyDescriptionLineBreak`: false', function () {
  const schema = {
    type: 'object'
  }
  const expected = `/**
 * @typedef {object}
 */
`
  expect(generate(schema, {
    autoDescribe: false,
    emptyDescriptionLineBreak: false
  })).toEqual(expected)
})

it('Simple object with `propertiesLineBreak`: false', function () {
  const schema = {
    type: 'object',
    properties: {
      aStringProp: {
        type: 'string'
      }
    }
  }
  const expected = `/**
 * Represents an object
 * @typedef {object}
 * @property {string} [aStringProp] -${trailingSpace}
 */
`
  expect(generate(schema, {
    propertiesLineBreak: false
  })).toEqual(expected)
})

it('Simple object with `types`: false', function () {
  const schema = {
    type: 'object'
  }
  const expected = `/**
 * Represents an object
 * @typedef
 */
`
  expect(generate(schema, {
    types: false
  })).toEqual(expected)
})

it('Simple object with empty string `types`', function () {
  const schema = {
    type: 'object'
  }
  const expected = `/**
 * Represents an object
 * @typedef {}
 */
`
  expect(generate(schema, {
    types: {
      object: ''
    }
  })).toEqual(expected)
})

it('Simple object with `types`', function () {
  const schema = {
    type: 'object'
  }
  const expected = `/**
 * Represents an object
 * @typedef {PlainObject}
 */
`
  expect(generate(schema, {
    types: {
      object: 'PlainObject'
    }
  })).toEqual(expected)
})

it('Simple object with title', function () {
  const schema = {
    title: 'special',
    type: 'object'
  }
  const expected = `/**
 * Represents a special object
 * @typedef {object} Special
 */
`
  expect(generate(schema)).toEqual(expected)
})

it('Simple object with title and `capitalizeTitle`: false', function () {
  const schema = {
    title: 'special',
    type: 'object'
  }
  const expected = `/**
 * Represents a special object
 * @typedef {object} special
 */
`
  expect(generate(schema, {
    capitalizeTitle: false
  })).toEqual(expected)
})

it('Object with properties', function () {
  const schema = {
    type: 'object',
    properties: {
      aStringProp: {
        type: 'string'
      },
      anObjectProp: {
        type: 'object',
        properties: {
          aNestedProp: {
            description: 'Boolean desc.',
            type: 'boolean'
          }
        }
      },
      nullableType: {
        type: ['string', 'null']
      },
      multipleTypes: {
        type: ['string', 'number']
      },
      enumProp: {
        enum: ['hello', 'world']
      }
    }
  }
  const expected = `/**
 * Represents an object
 * @typedef {object}
 *
 * @property {string} [aStringProp] -${trailingSpace}
 * @property {object} [anObjectProp] -${trailingSpace}
 * @property {boolean} [.aNestedProp] - Boolean desc.
 * @property {?string} [nullableType] -${trailingSpace}
 * @property {string|number} [multipleTypes] -${trailingSpace}
 * @property {enum} [enumProp] -${trailingSpace}
 */
`
  expect(generate(schema)).toEqual(expected)
})

it('Object with properties with space indent', function () {
  const schema = {
    type: 'object',
    properties: {
      aStringProp: {
        type: 'string'
      },
      anObjectProp: {
        type: 'object',
        properties: {
          aNestedProp: {
            description: 'Boolean desc.',
            type: 'boolean'
          }
        }
      },
      nullableType: {
        type: ['string', 'null']
      },
      multipleTypes: {
        type: ['string', 'number']
      },
      enumProp: {
        enum: ['hello', 'world']
      }
    }
  }
  const spaces = '   '
  const expected = `${spaces}/**
${spaces} * Represents an object
${spaces} * @typedef {object}
${spaces} *
${spaces} * @property {string} [aStringProp] -${trailingSpace}
${spaces} * @property {object} [anObjectProp] -${trailingSpace}
${spaces} * @property {boolean} [.aNestedProp] - Boolean desc.
${spaces} * @property {?string} [nullableType] -${trailingSpace}
${spaces} * @property {string|number} [multipleTypes] -${trailingSpace}
${spaces} * @property {enum} [enumProp] -${trailingSpace}
${spaces} */
`
  expect(generate(schema, {
    indent: 3
  })).toEqual(expected)
})

it('Object with properties with tab indent', function () {
  const schema = {
    type: 'object',
    properties: {
      aStringProp: {
        type: 'string'
      },
      anObjectProp: {
        type: 'object',
        properties: {
          aNestedProp: {
            description: 'Boolean desc.',
            type: 'boolean'
          }
        }
      },
      nullableType: {
        type: ['string', 'null']
      },
      multipleTypes: {
        type: ['string', 'number']
      },
      enumProp: {
        enum: ['hello', 'world']
      }
    }
  }
  const tabs = '\t\t\t'
  const expected = `${tabs}/**
${tabs} * Represents an object
${tabs} * @typedef {object}
${tabs} *
${tabs} * @property {string} [aStringProp] -${trailingSpace}
${tabs} * @property {object} [anObjectProp] -${trailingSpace}
${tabs} * @property {boolean} [.aNestedProp] - Boolean desc.
${tabs} * @property {?string} [nullableType] -${trailingSpace}
${tabs} * @property {string|number} [multipleTypes] -${trailingSpace}
${tabs} * @property {enum} [enumProp] -${trailingSpace}
${tabs} */
`
  expect(generate(schema, {
    indentChar: '\t',
    indent: 3
  })).toEqual(expected)
})

it('Object with properties (with false `descriptionPlaceholder`)', function () {
  const schema = {
    type: 'object',
    properties: {
      aStringProp: {
        type: 'string'
      },
      anObjectProp: {
        type: 'object',
        properties: {
          aNestedProp: {
            description: 'Boolean desc.',
            type: 'boolean'
          }
        }
      },
      nullableType: {
        type: ['string', 'null']
      },
      multipleTypes: {
        type: ['string', 'number']
      },
      enumProp: {
        enum: ['hello', 'world']
      }
    }
  }
  const expected = `/**
 * Represents an object
 * @typedef {object}
 *
 * @property {string} [aStringProp]
 * @property {object} [anObjectProp]
 * @property {boolean} [.aNestedProp] - Boolean desc.
 * @property {?string} [nullableType]
 * @property {string|number} [multipleTypes]
 * @property {enum} [enumProp]
 */
`
  expect(generate(schema, {
    descriptionPlaceholder: false
  })).toEqual(expected)
})

it('Object with properties (with false `hyphenatedDescriptions`)', function () {
  const schema = {
    type: 'object',
    properties: {
      aStringProp: {
        type: 'string'
      },
      anObjectProp: {
        type: 'object',
        properties: {
          aNestedProp: {
            description: 'Boolean desc.',
            type: 'boolean'
          }
        }
      },
      nullableType: {
        type: ['string', 'null']
      },
      multipleTypes: {
        type: ['string', 'number']
      },
      enumProp: {
        enum: ['hello', 'world']
      }
    }
  }
  const expected = `/**
 * Represents an object
 * @typedef {object}
 *
 * @property {string} [aStringProp]${trailingSpace}
 * @property {object} [anObjectProp]${trailingSpace}
 * @property {boolean} [.aNestedProp] Boolean desc.
 * @property {?string} [nullableType]${trailingSpace}
 * @property {string|number} [multipleTypes]${trailingSpace}
 * @property {enum} [enumProp]${trailingSpace}
 */
`
  expect(generate(schema, {
    hyphenatedDescriptions: false
  })).toEqual(expected)
})

it('Schema with `$ref`', function () {
  const schema = {
    $defs: { // New name for `definitions`
      definitionType: {
        type: 'number'
      }
    },
    type: 'object',
    properties: {
      aNumberProp: {
        $ref: '#/$defs/definitionType'
      }
    }
  }
  const expected = `/**
 * Represents an object
 * @typedef {object}
 *
 * @property {number} [aNumberProp] -${trailingSpace}
 */
`
  expect(generate(schema)).toEqual(expected)
})

it('Object with properties and `required`', function () {
  const schema = {
    type: 'object',
    properties: {
      anObjectProp: {
        type: 'object',
        required: ['aNestedProp'],
        properties: {
          aNestedProp: {
            type: 'boolean'
          },
          anotherNestedProp: {
            type: 'number'
          }
        }
      },
      propWithDefault: {
        type: 'string',
        default: 'hello'
      }
    }
  }
  const expected = `/**
 * Represents an object
 * @typedef {object}
 *
 * @property {object} [anObjectProp] -${trailingSpace}
 * @property {boolean} .aNestedProp -${trailingSpace}
 * @property {number} [.anotherNestedProp] -${trailingSpace}
 * @property {string} [propWithDefault="hello"] -${trailingSpace}
 */
`
  expect(generate(schema)).toEqual(expected)
})

it('Object with untyped property', function () {
  const schema = {
    type: 'object',
    properties: {
      anObjectProp: {
        type: 'object',
        properties: {
          aNestedProp: {
          },
          anotherNestedProp: {
            type: 'number'
          }
        }
      }
    }
  }
  const expected = `/**
 * Represents an object
 * @typedef {object}
 *
 * @property {object} [anObjectProp] -${trailingSpace}
 * @property {ANestedProp} [.aNestedProp] -${trailingSpace}
 * @property {number} [.anotherNestedProp] -${trailingSpace}
 */
`
  expect(generate(schema)).toEqual(expected)
})

it('Object with properties and `ignore` option', function () {
  const schema = {
    type: 'object',
    properties: {
      aStringProp: {
        type: 'string'
      },
      anObjectProp: {
        type: 'object',
        properties: {
          aNestedProp: {
            type: 'boolean'
          }
        }
      }
    }
  }
  const expected = `/**
 * Represents an object
 * @typedef {object}
 *
 * @property {string} [aStringProp] -${trailingSpace}
 */
`
  expect(generate(schema, {
    ignore: ['anObjectProp']
  })).toEqual(expected)
})
