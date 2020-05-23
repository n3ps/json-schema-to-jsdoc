'use strict'

module.exports = {
  extends: ['eslint:recommended', 'standard'],
  env: {
    node: true
  },
  overrides: [{
    files: 'test.js',
    globals: {
      assert: true
    },
    env: {
      mocha: true
    }
  }],
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
