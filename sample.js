const json = require('json-pointer');
const generate = require('./index');

const schema = require('./message');
const path = '/definitions/messages';

const messageTypes = Object.keys(json.get(schema, path));
const docs = messageTypes.map(generate).join('\n');

console.log(docs);