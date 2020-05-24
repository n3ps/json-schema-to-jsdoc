'use strict'
const generate = require('./index')
const fs = require('fs')

const schema = {
  id: 'Person',
  type: 'object',
  properties: {
    name: { type: 'string', description: "A person's name" },
    age: { type: 'integer', description: "A person's age" }
  },
  required: ['name']
}

fs.writeFileSync('docs.js', generate(schema))
