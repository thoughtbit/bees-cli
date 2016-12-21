const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const paths = require('./paths')
const getEntry = require('./../utils/getEntry')
const getConfig = require('./../utils/getConfig')

const config = getConfig()
const publicPath = '/'

module.exports = {
  entry: getEntry(),
  output: {
    path: paths.appBuild,
    filename: '[name].js',
    publicPath: publicPath
  },
  resolve: {
    extensions: ['.js', '.json', '.jsx', '.ts', 'tsx', ''],
    alias: {
      'src': paths.resolveApp('./../src'),
      'assets': paths.resolveApp('./../src/assets'),
      'components': paths.resolveApp('./../src/components')
    }
  },
  resolveLoader: {
    root: paths.ownNodeModules
  },
  module: {
    loaders: [
      {
        exclude: [
          /\.html$/,
          /\.(js|jsx)$/,
          /\.css$/,
          /\.json$/,
          /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          /\.(woff2?|eot|ttf|otf)(\?.*)?$/
        ],
        loader: 'url',
        query: {
          limit: 10000,
          name: 'static/[name].[hash:8].[ext]'
        }
      },
      {
        test: /\.(js|jsx)$/,
        include: paths.appSrc,
        loader: 'babel'
      },
      {
        test: /\.html$/,
        loader: 'file?name=[name].[ext]'
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.svg$/,
        loader: 'file',
        query: {
          name: 'static/[name].[hash:8].[ext]'
        }
      }
    ]
  },
  babel: {
    presets: [
      require.resolve('babel-preset-es2015'),
      require.resolve('babel-preset-stage-0')
    ].concat(config.extraBabelPresets || []),
    plugins: [
      require.resolve('babel-plugin-add-module-exports')
    ].concat(config.extraBabelPlugins || []),
    cacheDirectory: true
  },
  postcss: function () {
    return [
      autoprefixer(config.autoprefixer || {
        browsers: [
          '>1%',
          'last 4 versions',
          'Firefox ESR',
          'not ie < 9' // React doesn't support IE8 anyway
        ]
      })
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    })
  ],
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
}
