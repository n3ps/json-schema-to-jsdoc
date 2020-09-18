'use strict'

const generate = require('./index')
const jsdoc = generate

const trailingSpace = ' '

const schema = {
  title: 'Person',
  type: 'object',
  properties: {
    name: { type: 'string', description: "A person's name" },
    age: { type: 'integer', description: "A person's age" }
  },
  required: ['name']
}

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

  it('String with enum', function () {
    const schema = {
      type: 'string',
      enum: ['some', 'different', 'types']
    }
    const expected = `/**
 * @typedef {"some"|"different"|"types"}
 */
`
    expect(generate(schema)).toEqual(expected)
  })

  it('Number with enum', function () {
    const schema = {
      type: 'number',
      enum: [12, 34.5, 6789]
    }
    const expected = `/**
 * @typedef {12|34.5|6789}
 */
`
    expect(generate(schema)).toEqual(expected)
  })

  it('Integer with enum', function () {
    const schema = {
      type: 'integer',
      enum: [12, 345, 6789]
    }
    const expected = `/**
 * @typedef {12|345|6789}
 */
`
    expect(generate(schema)).toEqual(expected)
  })

  it('Boolean with enum', function () {
    const schema = {
      type: 'boolean',
      enum: [false, true, false]
    }
    const expected = `/**
 * @typedef {false|true|false}
 */
`
    expect(generate(schema)).toEqual(expected)
  })

  it('null with enum', function () {
    const schema = {
      type: 'null',
      enum: [null]
    }
    const expected = `/**
 * @typedef {null}
 */
`
    expect(generate(schema)).toEqual(expected)
  })

  it('Simple array with title', function () {
    const schema = {
      title: 'special',
      type: 'array'
    }
    const expected = `/**
 * @typedef {array} special
 */
`
    expect(generate(schema)).toEqual(expected)
  })
})

describe('Schemas with properties', () => {
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
            },
            aNestedArrayProp: {
              description: 'Array desc.',
              type: 'array',
              items: [
                {
                  type: 'number'
                }
              ]
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
        },
        enumStringProp: {
          type: 'string',
          enum: ['hello', 'there', 'world']
        }
      }
    }
    const expected = `/**
 * @typedef {object}
 * @property {string} [aStringProp]
 * @property {object} [anObjectProp]
 * @property {boolean} [anObjectProp.aNestedProp] Boolean desc.
 * @property {array} [anObjectProp.aNestedArrayProp] Array desc.
 * @property {number} anObjectProp.aNestedArrayProp.0
 * @property {?string} [nullableType]
 * @property {string|number} [multipleTypes]
 * @property {enum} [enumProp]
 * @property {"hello"|"there"|"world"} [enumStringProp]
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

  it('Required object', function () {
    const schema = {
      type: 'object',
      title: 'NestedType',
      properties: {
        cfg: {
          type: 'object',
          properties: {
          }
        }
      },
      required: [
        'cfg'
      ]
    }

    const expected = `/**
 * @typedef {PlainObject} NestedType
 * @property {object} cfg
 */
`

    expect(generate(schema, {
      types: {
        object: 'PlainObject'
      }
    })).toEqual(expected)
  })

  it('Required array', function () {
    const schema = {
      type: 'object',
      title: 'NestedType',
      properties: {
        cfg: {
          type: 'array',
          items: []
        }
      },
      required: [
        'cfg'
      ]
    }

    const expected = `/**
 * @typedef {object} NestedType
 * @property {array} cfg
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
 * @property {*} [anObjectProp.aNestedProp]
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

describe('Schemas with items', function () {
  it('Schema with `$ref` (array with items array), default', function () {
    const schema = {
      $defs: { // New name for `definitions`
        definitionType: {
          title: 'customNumber',
          type: 'number'
        }
      },
      type: 'array',
      items: [{
        $ref: '#/$defs/definitionType'
      }]
    }
    const expected = `/**
 * @typedef {array}
 * @property {number} 0
 */

/**
 * @typedef {number} customNumber
 */
`
    expect(generate(schema)).toEqual(expected)
  })

  it('Schema with `$ref` (array with items array), is-a', function () {
    const schema = {
      $defs: { // New name for `definitions`
        definitionType: {
          title: 'customNumber',
          type: 'number'
        }
      },
      type: 'array',
      items: [{
        $ref: '#/$defs/definitionType',
        classRelation: 'is-a'
      }]
    }
    const expected = `/**
 * @typedef {array}
 * @property {customNumber} 0
 */

/**
 * @typedef {number} customNumber
 */
`
    expect(generate(schema)).toEqual(expected)
  })

  it('Schema with `$ref` (array with items object)', function () {
    const schema = {
      $defs: { // New name for `definitions`
        definitionType: {
          title: 'customNumber',
          type: 'number'
        }
      },
      type: 'array',
      items: {
        $ref: '#/$defs/definitionType'
      }
    }
    const expected = `/**
 * @typedef {array}
 */

/**
 * @typedef {number} customNumber
 */
`
    expect(generate(schema)).toEqual(expected)
  })

  it('Array with items', function () {
    const schema = {
      type: 'array',
      items: [
        {
          type: 'string'
        },
        {
          type: 'object',
          properties: {
            aNestedProp: {
              description: 'Boolean desc.',
              type: 'boolean'
            }
          }
        },
        {
          type: ['string', 'null']
        },
        {
          type: ['string', 'number']
        },
        {
          enum: ['hello', 'world']
        }
      ]
    }
    const expected = `/**
 * @typedef {array}
 * @property {string} 0
 * @property {object} 1
 * @property {boolean} [1.aNestedProp] Boolean desc.
 * @property {?string} 2
 * @property {string|number} 3
 * @property {enum} 4
 */
`
    expect(generate(schema)).toEqual(expected)
  })

  it('Array with untyped property', function () {
    const schema = {
      type: 'array',
      items: [
        {
          type: 'array',
          items: [
            {
            },
            {
              type: 'number'
            }
          ]
        }
      ]
    }
    const expected = `/**
 * @typedef {array}
 * @property {array} 0
 * @property {*} 0.0
 * @property {number} 0.1
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

describe('Nested schemas', () => {
  it('Simple Object reference default, first element', () => {
    const schema = {
      $defs: {
        Person: {
          title: 'Person',
          type: 'object',
          properties: {
            name: { type: 'string', description: "A person's name" },
            age: { type: 'integer', description: "A person's age" }
          }
        }
      },
      title: 'Laborer',
      $ref: '#/$defs/Person'
    }
    const expected = `/**
 * @typedef {object} Laborer
 * @property {string} [name] A person's name
 * @property {integer} [age] A person's age
 */

/**
 * @typedef {object} Person
 * @property {string} [name] A person's name
 * @property {integer} [age] A person's age
 */
`
    expect(generate(schema)).toEqual(expected)
  })

  it('Simple Object reference default, nested element', () => {
    const schema = {
      $defs: {
        Person: {
          title: 'Person',
          type: 'object',
          properties: {
            name: { type: 'string', description: "A person's name" },
            age: { type: 'integer', description: "A person's age" }
          }
        }
      },
      title: 'LaborerList',
      type: 'object',
      properties: {
        Laborer: {
          title: 'Laborer',
          $ref: '#/$defs/Person'
        }
      }
    }
    const expected = `/**
 * @typedef {object} LaborerList
 * @property {object} [Laborer]
 * @property {string} [Laborer.name] A person's name
 * @property {integer} [Laborer.age] A person's age
 */

/**
 * @typedef {object} Person
 * @property {string} [name] A person's name
 * @property {integer} [age] A person's age
 */
`
    expect(generate(schema)).toEqual(expected)
  })

  it('Simple Object reference is-a, first element', () => {
    const schema = {
      $defs: {
        Person: {
          title: 'Person',
          type: 'object',
          properties: {
            name: { type: 'string', description: "A person's name" },
            age: { type: 'integer', description: "A person's age" }
          }
        }
      },
      title: 'Laborer',
      $ref: '#/$defs/Person',
      classRelation: 'is-a'
    }
    const expected = `/**
 * @typedef {Person} Laborer
 */

/**
 * @typedef {object} Person
 * @property {string} [name] A person's name
 * @property {integer} [age] A person's age
 */
`
    expect(generate(schema)).toEqual(expected)
  })

  it('Simple Object reference is-a, nested element', () => {
    const schema = {
      $defs: {
        Person: {
          title: 'Person',
          type: 'object',
          properties: {
            name: { type: 'string', description: "A person's name" },
            age: { type: 'integer', description: "A person's age" }
          }
        }
      },
      title: 'LaborerList',
      type: 'object',
      properties: {
        Laborer: {
          title: 'Laborer',
          $ref: '#/$defs/Person',
          classRelation: 'is-a'
        }
      }
    }
    const expected = `/**
 * @typedef {object} LaborerList
 * @property {Person} [Laborer]
 */

/**
 * @typedef {object} Person
 * @property {string} [name] A person's name
 * @property {integer} [age] A person's age
 */
`
    expect(generate(schema)).toEqual(expected)
  })

  it('allOf reference default', () => {
    const schema = {
      $defs: {
        Person: {
          title: 'Person',
          type: 'object',
          properties: {
            name: { type: 'string', description: "A person's name" },
            age: { type: 'integer', description: "A person's age" }
          }
        },
        Address: {
          title: 'Address',
          type: 'object',
          properties: {
            town: { type: 'string', description: 'The town' },
            street: { type: 'string', description: 'The street' },
            number: { type: 'integer', description: 'The number' }
          }
        }
      },
      title: 'List',
      type: 'object',
      properties: {
        Laborer: {
          title: 'Laborer',
          allOf: [
            { $ref: '#/$defs/Person' },
            { $ref: '#/$defs/Address' }
          ]
        }
      }
    }
    const expected = `/**
 * @typedef {object} List
 * @property {object} [Laborer]
 * @property {string} [Laborer.name] A person's name
 * @property {integer} [Laborer.age] A person's age
 * @property {string} [Laborer.town] The town
 * @property {string} [Laborer.street] The street
 * @property {integer} [Laborer.number] The number
 */

/**
 * @typedef {object} Person
 * @property {string} [name] A person's name
 * @property {integer} [age] A person's age
 */

/**
 * @typedef {object} Address
 * @property {string} [town] The town
 * @property {string} [street] The street
 * @property {integer} [number] The number
 */
`
    expect(generate(schema)).toEqual(expected)
  })

  it('allOf reference is-a', () => {
    const schema = {
      $defs: {
        Person: {
          title: 'Person',
          type: 'object',
          properties: {
            name: { type: 'string', description: "A person's name" },
            age: { type: 'integer', description: "A person's age" }
          }
        },
        Address: {
          title: 'Address',
          type: 'object',
          properties: {
            town: { type: 'string', description: 'The town' },
            street: { type: 'string', description: 'The street' },
            number: { type: 'integer', description: 'The number' }
          }
        }
      },
      title: 'List',
      type: 'object',
      properties: {
        Laborer: {
          title: 'Laborer',
          allOf: [
            { $ref: '#/$defs/Person', classRelation: 'is-a' },
            { $ref: '#/$defs/Address', classRelation: 'is-a' }
          ]
        }
      }
    }
    const expected = `/**
 * @typedef {object} List
 * @property {Person&Address} [Laborer]
 */

/**
 * @typedef {object} Person
 * @property {string} [name] A person's name
 * @property {integer} [age] A person's age
 */

/**
 * @typedef {object} Address
 * @property {string} [town] The town
 * @property {string} [street] The street
 * @property {integer} [number] The number
 */
`
    expect(generate(schema)).toEqual(expected)
  })

  it('allOf reference nested object', () => {
    const schema = {
      title: 'List',
      type: 'object',
      properties: {
        Laborer: {
          title: 'Laborer',
          allOf: [
            {
              type: 'object',
              properties: {
                Number: { type: 'number', description: 'A number' },
                String: { type: 'string', description: 'A String' }
              }
            }
          ]
        }
      }
    }
    const expected = `/**
 * @typedef {object} List
 * @property {object} [Laborer]
 * @property {number} [Laborer.Number] A number
 * @property {string} [Laborer.String] A String
 */
`
    expect(generate(schema)).toEqual(expected)
  })

  it('allOf reference is-a, default and nested Object', () => {
    const schema = {
      $defs: {
        Person: {
          title: 'Person',
          type: 'object',
          properties: {
            name: { type: 'string', description: "A person's name" },
            age: { type: 'integer', description: "A person's age" }
          }
        },
        Address: {
          title: 'Address',
          type: 'object',
          properties: {
            town: { type: 'string', description: 'The town' },
            street: { type: 'string', description: 'The street' },
            number: { type: 'integer', description: 'The number' }
          }
        }
      },
      title: 'List',
      type: 'object',
      properties: {
        Laborer: {
          title: 'Laborer',
          allOf: [
            { $ref: '#/$defs/Person' },
            { $ref: '#/$defs/Address', classRelation: 'is-a' },
            {
              type: 'object',
              properties: {
                Number: { type: 'number', description: 'A number' },
                String: { type: 'string', description: 'A String' }
              }
            }
          ]
        }
      }
    }
    const expected = `/**
 * @typedef {object} List
 * @property {Address} [Laborer]
 * @property {string} [Laborer.name] A person's name
 * @property {integer} [Laborer.age] A person's age
 * @property {number} [Laborer.Number] A number
 * @property {string} [Laborer.String] A String
 */

/**
 * @typedef {object} Person
 * @property {string} [name] A person's name
 * @property {integer} [age] A person's age
 */

/**
 * @typedef {object} Address
 * @property {string} [town] The town
 * @property {string} [street] The street
 * @property {integer} [number] The number
 */
`
    expect(generate(schema)).toEqual(expected)
  })

  it('anyOf reference default', () => {
    const schema = {
      $defs: {
        Person: {
          title: 'Person',
          type: 'object',
          properties: {
            name: { type: 'string', description: "A person's name" },
            age: { type: 'integer', description: "A person's age" }
          }
        },
        Address: {
          title: 'Address',
          type: 'object',
          properties: {
            town: { type: 'string', description: 'The town' },
            street: { type: 'string', description: 'The street' },
            number: { type: 'integer', description: 'The number' }
          }
        }
      },
      title: 'List',
      type: 'object',
      properties: {
        Laborer: {
          title: 'Laborer',
          anyOf: [
            { $ref: '#/$defs/Person' },
            { $ref: '#/$defs/Address' }
          ]
        }
      }
    }
    const expected = `/**
 * @typedef {object} List
 * @property {Laborer_Person|Laborer_Address} [Laborer]
 */

/**
 * @typedef {object} Person
 * @property {string} [name] A person's name
 * @property {integer} [age] A person's age
 */

/**
 * @typedef {object} Address
 * @property {string} [town] The town
 * @property {string} [street] The street
 * @property {integer} [number] The number
 */

/**
 * @typedef {object} Laborer_Person
 * @property {string} [name] A person's name
 * @property {integer} [age] A person's age
 */

/**
 * @typedef {object} Laborer_Address
 * @property {string} [town] The town
 * @property {string} [street] The street
 * @property {integer} [number] The number
 */
`
    expect(generate(schema)).toEqual(expected)
  })

  it('anyOf reference is-a', () => {
    const schema = {
      $defs: {
        Person: {
          title: 'Person',
          type: 'object',
          properties: {
            name: { type: 'string', description: "A person's name" },
            age: { type: 'integer', description: "A person's age" }
          }
        },
        Address: {
          title: 'Address',
          type: 'object',
          properties: {
            town: { type: 'string', description: 'The town' },
            street: { type: 'string', description: 'The street' },
            number: { type: 'integer', description: 'The number' }
          }
        }
      },
      title: 'List',
      type: 'object',
      properties: {
        Laborer: {
          title: 'Laborer',
          anyOf: [
            { $ref: '#/$defs/Person', classRelation: 'is-a' },
            { $ref: '#/$defs/Address', classRelation: 'is-a' }
          ]
        }
      }
    }
    const expected = `/**
 * @typedef {object} List
 * @property {Person|Address} [Laborer]
 */

/**
 * @typedef {object} Person
 * @property {string} [name] A person's name
 * @property {integer} [age] A person's age
 */

/**
 * @typedef {object} Address
 * @property {string} [town] The town
 * @property {string} [street] The street
 * @property {integer} [number] The number
 */
`
    expect(generate(schema)).toEqual(expected)
  })

  it('anyOf reference nested object', () => {
    const schema = {
      title: 'List',
      type: 'object',
      properties: {
        Laborer: {
          title: 'Laborer',
          anyOf: [
            {
              type: 'object',
              properties: {
                Number: { type: 'number', description: 'A number' },
                String: { type: 'string', description: 'A String' }
              }
            }
          ]
        }
      }
    }
    const expected = `/**
 * @typedef {object} List
 * @property {Laborer_subtype0} [Laborer]
 */

/**
 * @typedef {object} Laborer_subtype0
 * @property {number} [Number] A number
 * @property {string} [String] A String
 */
`
    expect(generate(schema)).toEqual(expected)
  })

  it('anyOf reference is-a, default and nested Object', () => {
    const schema = {
      $defs: {
        Person: {
          title: 'Person',
          type: 'object',
          properties: {
            name: { type: 'string', description: "A person's name" },
            age: { type: 'integer', description: "A person's age" }
          }
        },
        Address: {
          title: 'Address',
          type: 'object',
          properties: {
            town: { type: 'string', description: 'The town' },
            street: { type: 'string', description: 'The street' },
            number: { type: 'integer', description: 'The number' }
          }
        }
      },
      title: 'List',
      type: 'object',
      properties: {
        Laborer: {
          title: 'Laborer',
          anyOf: [
            { $ref: '#/$defs/Person' },
            { $ref: '#/$defs/Address', classRelation: 'is-a' },
            {
              type: 'object',
              properties: {
                Number: { type: 'number', description: 'A number' },
                String: { type: 'string', description: 'A String' }
              }
            }
          ]
        }
      }
    }
    const expected = `/**
 * @typedef {object} List
 * @property {Address|Laborer_Person|Laborer_subtype0} [Laborer]
 */

/**
 * @typedef {object} Person
 * @property {string} [name] A person's name
 * @property {integer} [age] A person's age
 */

/**
 * @typedef {object} Address
 * @property {string} [town] The town
 * @property {string} [street] The street
 * @property {integer} [number] The number
 */

/**
 * @typedef {object} Laborer_Person
 * @property {string} [name] A person's name
 * @property {integer} [age] A person's age
 */

/**
 * @typedef {object} Laborer_subtype0
 * @property {number} [Number] A number
 * @property {string} [String] A String
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
  it('Simple object with `types`: null', function () {
    const schema = {
      type: 'object'
    }
    const expected = `/**
 * @typedef
 */
`
    expect(generate(schema, {
      types: null
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

describe('option: `propertyNameAsType`', function () {
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
 * @property {aNestedProp} [anObjectProp.aNestedProp]
 * @property {number} [anObjectProp.anotherNestedProp]
 */
`
    expect(generate(schema, {
      propertyNameAsType: true
    })).toEqual(expected)
  })
})

describe('option: `capitalizeProperty`', function () {
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
    expect(generate(schema, {
      propertyNameAsType: true,
      capitalizeProperty: true
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

describe('option `defaultPropertyType`', function () {
  it('Object with untyped property and "JSON" `defaultPropertyType`', function () {
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
 * @property {JSON} [anObjectProp.aNestedProp]
 * @property {number} [anObjectProp.anotherNestedProp]
 */
`
    expect(generate(schema, {
      defaultPropertyType: 'JSON'
    })).toEqual(expected)
  })

  it('Object with untyped property and `false` `defaultPropertyType`', function () {
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
 * @property [anObjectProp.aNestedProp]
 * @property {number} [anObjectProp.anotherNestedProp]
 */
`
    expect(generate(schema, {
      defaultPropertyType: null
    })).toEqual(expected)
  })
})

describe('option: `maxLength`', () => {
  it('Simple object with description and `maxLength`', function () {
    const schema = {
      type: 'object',
      properties: {
        aShortStringProp: {
          description: 'A short description',
          type: 'string'
        },
        aStringProp: {
          description: 'This is a very, very, very, very, very, very, very, very, very, very, very long description on the property.',
          type: 'string'
        },
        aNonBreakingStringProp: {
          description: 'https://example.com/a/very/very/very/very/very/very/very/very/long/nonbreaking/string',
          type: 'string'
        },
        aLongStringBreakingAtEnd: {
          description: 'https://example.com/another/very/very/very/very/very/very/very/lng/string breaking at end',
          type: 'string'
        }
      },
      description: 'This is a very, very, very, very, very, very, very, very, very, very, very long description.'
    }
    const indent = '    '
    const expected = `${indent}/**
${indent} * This is a very, very, very, very, very, very, very, very, very, very,
${indent} * very long description.
${indent} * @typedef {object}
${indent} * @property {string} [aShortStringProp] A short description
${indent} * @property {string} [aStringProp] This is a very, very, very, very, very,
${indent} * very, very, very, very, very, very long description on the property.
${indent} * @property {string} [aNonBreakingStringProp]
${indent} * https://example.com/a/very/very/very/very/very/very/very/very/long/nonbreaking/string
${indent} * @property {string} [aLongStringBreakingAtEnd]
${indent} * https://example.com/another/very/very/very/very/very/very/very/lng/string
${indent} * breaking at end
${indent} */
`
    expect(generate(schema, {
      indent: 4,
      maxLength: 80
    })).toEqual(expected)

    const expectedNowrapping = `${indent}/**
${indent} * This is a very, very, very, very, very, very, very, very, very, very, very long description.
${indent} * @typedef {object}
${indent} * @property {string} [aShortStringProp] A short description
${indent} * @property {string} [aStringProp] This is a very, very, very, very, very, very, very, very, very, very, very long description on the property.
${indent} * @property {string} [aNonBreakingStringProp] https://example.com/a/very/very/very/very/very/very/very/very/long/nonbreaking/string
${indent} * @property {string} [aLongStringBreakingAtEnd] https://example.com/another/very/very/very/very/very/very/very/lng/string breaking at end
${indent} */
`

    expect(generate(schema, {
      indent: 4
    })).toEqual(expectedNowrapping)
  })
})

describe('Examples', () => {
  it('No options', () => {
    const expected = `/**
 * @typedef {object} Person
 * @property {string} name A person's name
 * @property {integer} [age] A person's age
 */
`
    const result = jsdoc(schema)
    expect(result).toEqual(expected)
  })

  it('`hyphenatedDescriptions`', () => {
    const expected = `/**
 * @typedef {object} Person
 * @property {string} name - A person's name
 * @property {integer} [age] - A person's age
 */
`
    const result = jsdoc(schema, {
      hyphenatedDescriptions: true
    })
    expect(result).toEqual(expected)
  })

  it('`autoDescribe`', () => {
    const expected = `/**
 * Represents a Person object
 * @typedef {object} Person
 * @property {string} name A person's name
 * @property {integer} [age] A person's age
 */
`
    const result = jsdoc(schema, {
      autoDescribe: true
    })
    expect(result).toEqual(expected)
  })

  it('`types`', () => {
    const expected = `/**
 * @typedef {PlainObject} Person
 * @property {string} name A person's name
 * @property {integer} [age] A person's age
 */
`
    const result = jsdoc(schema, {
      types: {
        object: 'PlainObject'
      }
    })
    expect(result).toEqual(expected)
  })
})
