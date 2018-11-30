const fs = require('fs');
const path = require('path');
const baseConfig = require('./webpack.base.conf');
const merge = require('webpack-merge');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

const resolve = (dir) => path.join(__dirname, '..', dir);

const assetsRoot = resolve('.');
const assetsPublicPath = '/';
const assetsSubDirectory = 'static';
const cssExtract = false;

const baseWebpackConfig = baseConfig.webpackBaseConfig(assetsRoot, assetsPublicPath, assetsSubDirectory, cssExtract);

// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
  baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name]);
});

module.exports = merge(baseWebpackConfig, {
  mode: 'development',
  devtool: '#cheap-module-eval-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
      // serviceWorkerLoader: `<script>${fs.readFileSync(path.join(__dirname,
      //   './service-worker-dev.js'), 'utf-8')}</script>`
    }),
    new FriendlyErrorsPlugin()
  ]
});
