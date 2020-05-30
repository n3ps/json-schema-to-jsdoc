'use strict'

const generate = require('./index')

const trailingSpace = ' '

describe('Simple schemas', () => {
  it('Guards', function () {
    const inputs = [null, {}, undefined]
    inputs.forEach(input => {
      expect(generate(input)).toEqual('')
    })
  })

  it('Simple string', function () {
    const schema = { type: 'string' }
    const expected = `/**
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

  it('Simple object with title', function () {
    const schema = {
      title: 'special',
      type: 'object'
    }
    const expected = `/**
 * @typedef {object} special
 */
`
    expect(generate(schema)).toEqual(expected)
  })
})

describe('Schemas with properties', () => {
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
 * @typedef {object}
 * @property {number} [aNumberProp]
 */
`
    expect(generate(schema)).toEqual(expected)
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
 * @typedef {object}
 * @property {string} [aStringProp]
 * @property {object} [anObjectProp]
 * @property {boolean} [anObjectProp.aNestedProp] Boolean desc.
 * @property {?string} [nullableType]
 * @property {string|number} [multipleTypes]
 * @property {enum} [enumProp]
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
 * @typedef {object}
 * @property {object} [anObjectProp]
 * @property {boolean} anObjectProp.aNestedProp
 * @property {number} [anObjectProp.anotherNestedProp]
 * @property {string} [propWithDefault="hello"]
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
 * @typedef {object}
 * @property {object} [anObjectProp]
 * @property {ANestedProp} [anObjectProp.aNestedProp]
 * @property {number} [anObjectProp.anotherNestedProp]
 */
`
    expect(generate(schema)).toEqual(expected)
  })

  it('Object with deep nesting', function () {
    const schema = {
      type: 'object',
      properties: {
        anObjectProp: {
          type: 'object',
          properties: {
            aNestedProp: {
              type: 'object',
              properties: {
                aDeeplyNestedProp: {
                  type: 'number'
                }
              }
            }
          }
        }
      }
    }
    const expected = `/**
 * @typedef {object}
 * @property {object} [anObjectProp]
 * @property {object} [anObjectProp.aNestedProp]
 * @property {number} [anObjectProp.aNestedProp.aDeeplyNestedProp]
 */
`
    expect(generate(schema)).toEqual(expected)
  })
})

describe('option: `autoDescribe`', function () {
  it('Simple object with `autoDescribe`: true', function () {
    const schema = {
      type: 'object'
    }
    const expected = `/**
 * Represents an object
 * @typedef {object}
 */
`
    expect(generate(schema, {
      autoDescribe: true
    })).toEqual(expected)
  })

  it('Object with `title` and `autoDescribe`: true', function () {
    const schema = {
      type: 'object',
      title: 'Title'
    }
    const expected = `/**
 * Represents a Title object
 * @typedef {object} Title
 */
`
    expect(generate(schema, {
      autoDescribe: true
    })).toEqual(expected)
  })
})

describe('option: `autoDescriptionLineBreak`', () => {
  it('Simple object with `addDescriptionLineBreak`: true', function () {
    const schema = {
      type: 'object'
    }
    const expected = `/**
 *
 * @typedef {object}
 */
`
    expect(generate(schema, {
      addDescriptionLineBreak: true
    })).toEqual(expected)
  })
})

describe('option: `types`', () => {
  it('Simple object with `types`: false', function () {
    const schema = {
      type: 'object'
    }
    const expected = `/**
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
 * @typedef {PlainObject}
 */
`
    expect(generate(schema, {
      types: {
        object: 'PlainObject'
      }
    })).toEqual(expected)
  })
})

describe('option: `capitalizeTitle`', () => {
  it('Simple object with title and `capitalizeTitle`: true', function () {
    const schema = {
      title: 'special',
      type: 'object'
    }
    const expected = `/**
 * @typedef {object} Special
 */
`
    expect(generate(schema, {
      capitalizeTitle: true
    })).toEqual(expected)
  })
})

describe('option: `indent`', () => {
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
${spaces} * @typedef {object}
${spaces} * @property {string} [aStringProp]
${spaces} * @property {object} [anObjectProp]
${spaces} * @property {boolean} [anObjectProp.aNestedProp] Boolean desc.
${spaces} * @property {?string} [nullableType]
${spaces} * @property {string|number} [multipleTypes]
${spaces} * @property {enum} [enumProp]
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
${tabs} * @typedef {object}
${tabs} * @property {string} [aStringProp]
${tabs} * @property {object} [anObjectProp]
${tabs} * @property {boolean} [anObjectProp.aNestedProp] Boolean desc.
${tabs} * @property {?string} [nullableType]
${tabs} * @property {string|number} [multipleTypes]
${tabs} * @property {enum} [enumProp]
${tabs} */
`
    expect(generate(schema, {
      indentChar: '\t',
      indent: 3
    })).toEqual(expected)
  })
})

describe('option: `descriptionPlaceholder`', () => {
  it('Object with properties (with true `descriptionPlaceholder`)', function () {
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
 * @typedef {object}
 * @property {string} [aStringProp]${trailingSpace}
 * @property {object} [anObjectProp]${trailingSpace}
 * @property {boolean} [anObjectProp.aNestedProp] Boolean desc.
 * @property {?string} [nullableType]${trailingSpace}
 * @property {string|number} [multipleTypes]${trailingSpace}
 * @property {enum} [enumProp]${trailingSpace}
 */
`
    expect(generate(schema, {
      descriptionPlaceholder: true
    })).toEqual(expected)
  })
})

describe('option: `hyphenatedDescriptions`', () => {
  it('Object with properties (with true `hyphenatedDescriptions`)', function () {
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
 * @typedef {object}
 * @property {string} [aStringProp]
 * @property {object} [anObjectProp]
 * @property {boolean} [anObjectProp.aNestedProp] - Boolean desc.
 * @property {?string} [nullableType]
 * @property {string|number} [multipleTypes]
 * @property {enum} [enumProp]
 */
`
    expect(generate(schema, {
      hyphenatedDescriptions: true
    })).toEqual(expected)
  })
})

describe('option: `ignore`', () => {
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
 * @typedef {object}
 * @property {string} [aStringProp]
 */
`
    expect(generate(schema, {
      ignore: ['anObjectProp']
    })).toEqual(expected)
  })
})
