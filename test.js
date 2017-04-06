var {assert} = require('chai');
var jsonschema2jsdoc = require('./index');

it('Guards', function() {
  const inputs = [null, {}, undefined];
  inputs.forEach(input => {
    assert.equal(jsonschema2jsdoc(input), '');
  });
});

it('Simple object', function() {
  const schema = {"type": "string"};
  const expected = '/**  * Creates a undefined object  *';
  assert.equal(process(schema), expected);
});

function process(input) {
  return jsonschema2jsdoc(input).replace(/\n/gm, '');
}