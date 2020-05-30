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
  * Represents a undefined object
  * @name${trailingSpace}
  *
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
  * Represents a undefined object
  * @name${trailingSpace}
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
  * Represents a undefined object
  * @name${trailingSpace}
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
      }
    }
  }
  const expected = `/**
  * Represents a undefined object
  * @name${trailingSpace}
  *
  * @property {object} [anObjectProp] -${trailingSpace}
  * @property {boolean} .aNestedProp -${trailingSpace}
  * @property {number} [.anotherNestedProp] -${trailingSpace}
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
  * Represents a undefined object
  * @name${trailingSpace}
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
  * Represents a undefined object
  * @name${trailingSpace}
  *
  * @property {string} [aStringProp] -${trailingSpace}
  */
`
  expect(generate(schema, {
    ignore: ['anObjectProp']
  })).toEqual(expected)
})
