const fs = require('fs');
const json = require('json-pointer');

// TODO: 
// Non-nullable types
// Multiple types
// Recurse /definitions
// Remove user code

const schema = require('./message');
const path = '/definitions/messages';

module.exports = generate;

function generate(item) {console.log(item);
  // Custom
  const itemTitle = 'message';
  const dataPath = `${path}/${item}/properties/data/properties`;
  const data = json.has(schema, dataPath) ? json.get(schema, dataPath) : {};
  const requiredPath = `${path}/${item}/properties/data/required`;
  const required = json.has(schema, requiredPath) ? json.get(schema, requiredPath) : [];

  let jsdoc = '/**\n';
  jsdoc += writeTitle(item, itemTitle);

  for (let field in data) {
    // TODO: Optional fields nested under an options object?
    let isOptional = !required.includes(field);
    jsdoc += writeParam(field, getType(field, data[field]), 'Description goes here', isOptional);
  };

  jsdoc += '  */\n';

  return jsdoc;
}

function getType(fieldName, keywords) {
  if (keywords.hasOwnProperty('$ref')) {
    return upperFirst(fieldName);
  }
  return keywords.type;
}

function writeParam(field, type = '', description, isOptional) {
  const fieldTemplate = isOptional ? `[${field}]` : field;
  return `  * @param {${type}} ${fieldTemplate} ${description} \n`;
}

function writeTitle(type, suffix = 'object') {
  return `  * Creates a ${type} ${suffix}\n  *\n`;
}

function resolveRefs(ref) {
  return json.get(schema, ref);
}

function upperFirst(str) {
  return str.substr(0,1).toUpperCase() + str.substr(1);
}