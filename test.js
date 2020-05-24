'use strict'

const generate = require('./index')

it('Guards', function () {
  const inputs = [null, {}, undefined]
  inputs.forEach(input => {
    expect(generate(input)).toEqual('')
  })
})

it('Simple string', function () {
  const schema = { type: 'string' }
  const expected = '/**  * Represents a undefined object  * @name   *'
  expect(process(schema)).toEqual(expected)
})

function process (input) {
  return generate(input).replace(/\n/gm, '')
}
