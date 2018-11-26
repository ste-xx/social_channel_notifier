// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: ['plugin:vue/recommended', 'standard', 'plugin:jest/recommended'],
  // required to lint *.vue files
  plugins: [
    'html',
    'jest'
  ],
  // add your custom rules here
  rules: {
    'vue/html-closing-bracket-newline': ['warn', {
      singleline: 'never',
      multiline: 'never'
    }],
    'vue/max-attributes-per-line': ['error', {
      singleline: 5,
      multiline: {
        allowFirstLine: false,
        max: 5
      }
    }],
    'vue/component-name-in-template-casing': ['error', 'kebab-case'],
    'vue/html-closing-bracket-spacing': ['error', {
      startTag: 'never',
      endTag: 'never',
      selfClosingTag: 'never'
    }],
    'space-before-function-paren': ['error', {
      anonymous: 'ignore',
      named: 'ignore',
      asyncArrow: 'always'
    }],
    // temp
    'vue/script-indent': ["error", 2, {
      baseIndent: 1,
      switchCase: 0,
      ignores: []
    }],
    'object-curly-spacing': 'off',
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    // needed for chai expect
    'jest/valid-expect': 0,

    'semi': ["error", "always"],
  },
  overrides: [{
    files: ["*.vue"],
    rules: {
      indent: "off"
    }
  }]
};
