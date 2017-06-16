# JSON Schema to JSDoc

Useful when you already have a JSON Schema and want to document the types you want to validate. Works with subschema definitions.


## Usage
```js
const jsdoc = require('json-schema-to-jsdoc');

const schema = {
  "id": "Person",
  "type": "object",
  "properties": {
    "name": {"type": "string", "description": "A person's name"},
    "age": {"type": "integer", "description": "A person's age"}
  },
  "required" : ["name"]
}

jsdoc(schema);
```

### Output
```js
/** 
  * Creates a Person object
  *
  * @param {string} name - A person's name
  * @param {integer} [age] - A person's age
  */

class Person {}
```