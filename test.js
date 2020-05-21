'use strict';

const {assert} = require('chai');
const generate = require('./index');

it('Guards', function() {
  const inputs = [null, {}, undefined];
  inputs.forEach(input => {
    assert.equal(generate(input), '');
  });
});

it('Simple object', function() {
  const schema = {"type": "string"};
  const expected = '/**  * Represents a undefined object  * @name   *';
  assert.equal(process(schema), expected);
});

function process(input) {
  return generate(input).replace(/\n/gm, '');
}
