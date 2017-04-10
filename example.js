const json = require('json-pointer');
const generate = require( './index');
const fs = require('fs');

const schema = require('./message');
const list = json.get(schema, '/definitions/messages')

let docs = '';
Object.keys(list).forEach(key => {
  let options = {
    id: key + 'Message',
    ignore: ['messageType']
  };
  docs += generate(list[key], options);
});

fs.writeFileSync('docs.js', docs);