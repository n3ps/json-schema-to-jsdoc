const fs = require('fs');
const json = require('json-pointer');

module.exports = generate;

function generate(schema, options) {
  let jsdoc = '';

  if (!schema || Object.keys(schema).length === 0) {
    return jsdoc;
  }

  jsdoc += '/**\n';
  jsdoc += writeDescription(schema);

  if (!json.has(schema, '/properties')){
   return jsdoc;
  }

  jsdoc += processProperties(schema);

  jsdoc += '  */\n';

  jsdoc += writeType(schema);

  return jsdoc;
}

function processProperties(schema, nested = false) {
  const props = json.get(schema, '/properties');
  const required = json.has(schema, '/required') ? json.get(schema, '/required') : [];

  let text = '';
  for (let property in props) {
    if (props[property].type === 'object' && props[property].properties) {
      text += `  * @param {object} ${property}\n`;
      text += processProperties(props[property], true);
    } else {
      let prefix = nested ? 'params.' : '';
      let optional = !required.includes(property);
      let type = getType(props[property]) || upperFirst(property);
      text += writeParam(type, prefix + property, '', optional);
    }
  }
  return text;
}

function writeDescription(schema, suffix = 'object') {
  let text = schema.description || `Creates a ${schema.id} ${suffix}`;
  return `  * ${text}\n  *\n`;
}

function writeParam(type = '', field, description, optional) {
  const fieldTemplate = optional ? `[${field}]` : field;
  return `  * @param {${type}} ${fieldTemplate} ${description} \n`;
}

function writeType(schema) {
  return `class ${schema.id} {\n}`;
}

function getType(schema) {
  let prefix = '!';

  if (schema.enum && schema.enum.length === 1) {
    return typeof(schema.enum[0]);
  };

  if (Array.isArray(schema.type)) {
    let types = schema.type.join('|');
    if (types.includes('null')) {
      prefix = '';
    }
  }

  return schema.type;
}

function upperFirst(str) {
  return str.substr(0,1).toUpperCase() + str.substr(1);
}