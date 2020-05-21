'use strict';

module.exports = {
  extends: ['eslint:recommended'],
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
    semi: ['error'],
    indent: ['error', 2, {SwitchCase: 1}],
    'prefer-const': ['error'],
    'no-var': ['error'],
    'prefer-destructuring': ['error'],
    'object-shorthand': ['error'],
    'object-curly-spacing': ['error', 'never'],
    'brace-style': ['error', '1tbs'],
    'prefer-template': ['error']
  }
};
