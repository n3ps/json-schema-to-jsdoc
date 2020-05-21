'use strict';

// const fs = require('fs');
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

  return jsdoc;
}

function processProperties(schema, nested, options = {}) {
  const props = json.get(schema, '/properties');
  const required = json.has(schema, '/required') ? json.get(schema, '/required') : [];

  let text = '';
  for (const property in props) {
    if (Array.isArray(options.ignore) && options.ignore.includes(property)) {
      continue;
    } else {
      const prefix = nested ? '.' : '';

      if (props[property].type === 'object' && props[property].properties) {
        text += writeParam('object', prefix + property, props[property].description, true);
        text += processProperties(props[property], true);
      } else {
        const optional = !required.includes(property);
        const type = getType(props[property]) || upperFirst(property);
        text += writeParam(type, prefix + property, props[property].description, optional);
      }
    }
  }
  return text;
}

function writeDescription(schema, suffix = 'object') {
  let text = schema.description || `Represents a ${schema.id} ${suffix}`;
  text += `\n  * @name ${upperFirst(schema.id)}`;
  return `  * ${text}\n  *\n`;
}

function writeParam(type = '', field, description = '', optional) {
  const fieldTemplate = optional ? `[${field}]` : field;
  return `  * @property {${type}} ${fieldTemplate} - ${description} \n`;
}

function getType(schema) {
  if (schema.$ref) {
    const ref = json.get(global, schema.$ref.slice(1));
    return getType(ref);
  }

  if (schema.enum) {
    return 'enum';
  }

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
  return str.slice(0, 1).toUpperCase() + str.slice(1);
}
