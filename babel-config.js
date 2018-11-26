module.exports = function (api) {
  api.cache(true)

  const presets = [
    ['@babel/env', {
      modules: false,
      targets: {
        browsers: ['> 1%', 'last 2 versions', 'not ie <= 8']
      }
    }]
  ]

  const plugins = [
    ['@babel/plugin-proposal-decorators', {legacy: true}],
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-function-sent',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-throw-expressions',

    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    ['@babel/plugin-proposal-class-properties', {loose: false}],
    '@babel/plugin-proposal-json-strings'
  ]

  const env = {test: {presets: ['@babel/env']}}

  return {presets, plugins, env}
}
