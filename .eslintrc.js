'use strict'

module.exports = {
  extends: ['eslint:recommended', 'standard'],
  env: {
    jest: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 2015
  },
  rules: {
    'no-var': ['error'],
    'prefer-destructuring': ['error'],
    'object-shorthand': ['error'],
    'prefer-template': ['error']
  }
}
