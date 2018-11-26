const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const resolve = (dir) => path.join(__dirname, '..', dir);

exports.webpackBaseConfig = function(assetsRoot, assetsPublicPath, assetsSubDirectory, extractCss) {

  const assetsPath = (_path) => path.posix.join(assetsSubDirectory, _path);
  const extractor = extractCss ? MiniCssExtractPlugin.loader : 'vue-style-loader';



  return {
    entry: {
      app: ['@babel/polyfill', './src/main.js']
    },
    output: {
      path: assetsRoot,
      filename: '[name].js',
      publicPath: assetsPublicPath
    },
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias: {
        'vue$': 'vue/dist/vue.esm.js',
        '@': resolve('src'),
      }
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            transformAssetUrls: {
              video: 'src',
              source: 'src',
              img: 'src',
              image: 'xlink:href'
            }
          }
        },
        {
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          enforce: 'pre',
          include: [resolve('src'), resolve('test')],
          options: {
            formatter: require('eslint-friendly-formatter')
          }
        },
        {
          resourceQuery: /blockType=i18n/,
          loader: '@kazupon/vue-i18n-loader',
          type: 'javascript/auto'
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          include: [resolve('src'), resolve('test')]
        },
        {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: assetsPath('img/[name].[hash:7].[ext]')
          }
        },
        {
          test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: assetsPath('media/[name].[hash:7].[ext]')
          }
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: assetsPath('fonts/[name].[hash:7].[ext]')
          }
        },
        {
          test: /\.(css|postcss)$/,
          use: [extractor, 'css-loader']
        },
        {
          test: /\.less$/,
          use: [extractor, 'css-loader', 'less-loader']
        },
        {
          test: /\.(sass|scss)$/,
          use: [extractor, 'css-loader', 'sass-loader']
        },
        {
          test: /\.(stylus|styl)$/,
          use: [extractor, 'css-loader', 'stylus-loader']
        }
      ]
    },
    plugins: [
      new VueLoaderPlugin(),
    ],
  }
};
