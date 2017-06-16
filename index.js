const fs = require('fs');
const json = require('json-pointer');

module.exports = generate;

function generate(schema, options = {}) {
  let jsdoc = '';

  if (!schema || Object.keys(schema).length === 0) {
    return jsdoc;
  }

  jsdoc += '/**\n';
  jsdoc += writeDescription(schema);

  if (!json.has(schema, '/properties')){
   return jsdoc;
  }

  jsdoc += processProperties(schema, false, options);

  jsdoc += '  */\n';

  jsdoc += writeType(options.id);

  return jsdoc;
}

function processProperties(schema, nested, options = {}) {
  const props = json.get(schema, '/properties');
  const required = json.has(schema, '/required') ? json.get(schema, '/required') : [];

  let text = '';
  for (let property in props) {
    if (Array.isArray(options.ignore) && options.ignore.includes(property)) {
      continue;
    } else if (props[property].type === 'object' && props[property].properties) {
      text += `  * @param {object} ${property}\n`;
      text += processProperties(props[property], true);
    } else {
      let prefix = nested ? '.' : ''; // Match parent to nest
      let optional = !required.includes(property);
      let type = getType(props[property]) || upperFirst(property);
      text += writeParam(type, prefix + property, props[property].description, optional);
    }
  }
  return text;
}

function writeDescription(schema, suffix = 'object') {
  let text = schema.description || `Creates a ${schema.id} ${suffix}`;
  return `  * ${text}\n  *\n`;
}

function writeParam(type = '', field, description = '', optional) {
  const fieldTemplate = optional ? `[${field}]` : field;
  return `  * @param {${type}} ${fieldTemplate} - ${description} \n`;
}

function writeType(type) {
  let text = `class ${upperFirst(type)} {}\n`;
  return text;
}

function getType(schema) {
  if (schema.enum && schema.enum.length === 1) {
    return typeof(schema.enum[0]);
  };

  if (Array.isArray(schema.type)) {
    if (schema.type.includes('null')) {
      return `?${schema.type[0]}`;
    } else {
      return schema.type.join('|');
    }
  }

  return schema.type;
}

function upperFirst(str = '') {
  return str.substr(0,1).toUpperCase() + str.substr(1);
}