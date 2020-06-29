# JSON Schema to JSDoc

Useful when you already have a JSON Schema and want to document the types you want to validate. Works with subschema definitions.

## Usage

```js
const jsdoc = require('json-schema-to-jsdoc');

const schema = {
  "title": "Person",
  "type": "object",
  "properties": {
    "name": {"type": "string", "description": "A person's name"},
    "age": {"type": "integer", "description": "A person's age"}
  },
  "required" : ["name"]
}

jsdoc(schema /* , optionsObject */);
```

### Output

```js
/**
  * Represents a Person object
  * @typedef {object}
  * @property {string} name - A person's name
  * @property {integer} [age] - A person's age
  */
```

### Options

- `autoDescribe: boolean` - Whether to add a description
    (`"Represents a/n [<title> ]<type>"`) when the schema has no
    `description`. Defaults to `true`.
- `capitalizeTitle: boolean` - If `false` and a schema `title` is present,
    will prevent capitalizing the schema's `title` in the output of
    `@typedef [{type}] title`. Defaults to `true.`
- `descriptionPlaceholder: boolean` - If `false` and there is no `description`
    for the object `@property`, this will avoid a hyphen or even a space for
    `{description}` within `@property {name}{description}`. Defaults to `true`.
- `addDescriptionLineBreak: boolean` - Whether to include an extra
    placeholder line when `autoDescribe` is `false` and the schema
    `description` is empty. Defaults to `false`.
- `hyphenatedDescriptions: boolean` - If `false`, will avoid adding an initial
    hyphen + space in the `{description}` portion of
    `@property {name}{description}` (will add a space, however, unless
    `descriptionPlaceholder` is `false`). Defaults to `true`.
- `ignore: string[]` - Property names to ignore adding to output. Defaults to
    empty array.
- `indent: number` - How many of `indentChar` to precede each line. Defaults
    to `0` (no indent). Note that a single space will be added in addition to
    the indent for every line of the document block after the first.
- `indentChar: string` - Character to use when `indent` is set (e.g., a tab or
    space). Defaults to a space.
- `objectTagName: string` - Tag name to use for objects. Defaults to `typedef`.
- `types: boolean|{[schemaType: string]: string}` - Used to determine output of
    curly-bracketed type content within `@typedef {...}`.
    If `types` is `false`, no curly brackets or type content will be shown
    with the `@typedef` at all. If the schema `type` matches a property in the
    object map, and it maps to the empty string, an empty `{}` will result.
    Otherwise, if there is a `type` match, that string will be used as the
    curly bracketed type, or if there is no match, the schema's `type` will
    be used for the bracketed content. Defaults to an empty object map (will
    always just use the schema's `type`). This property may be used to change
    the likes of `@typedef {object}` to  `@typedef {PlainObject}`.
