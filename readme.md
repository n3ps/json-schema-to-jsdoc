# JSON Schema to JSDoc

Useful when you already have a JSON Schema and want to document its types. Best with multiple definitions.


## Usage
```js
const jsdoc = require('json-schema-to-jsdoc');

const schema = {
  "id": "Simple",
  "type": "object"
}

jsdoc(schema);

// /** 
//   * Creates a Simple object
//   *
//   */
// class Simple {
// }
```