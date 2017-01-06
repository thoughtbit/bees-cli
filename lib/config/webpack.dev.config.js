const fs = require('fs')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
const webpack = require('webpack')
const merge = require('webpack-merge')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const baseWebpackConfig = require('./webpack.base.config')
const paths = require('./paths')
const getConfig = require('./../utils/getConfig')
const cssLoaders = require('../utils/getCSSLoaders')
const normalizeDefine = require('../utils/normalizeDefine')

const config = getConfig()

const webpackConfig = merge(baseWebpackConfig, {
  devtool: 'cheap-module-source-map',
  output: {
    pathinfo: true
  },
  module: {
    loaders: cssLoaders.styleLoaders({ sourceMap: config.cssSourceMap })
  },
  babel: {
    babelrc: false
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new CaseSensitivePathsPlugin(),
    new WatchMissingNodeModulesPlugin(paths.appNodeModules)
  ].concat(
    !fs.existsSync(paths.appPublic) ? [] : new CopyWebpackPlugin([{
      from: paths.appPublic,
      to: paths.appBuild
    }])
  ).concat(
    !config.multipage ? [] : new webpack.optimize.CommonsChunkPlugin({ name: 'common' })
  ).concat(
    !config.define ? [] : new webpack.DefinePlugin(normalizeDefine(config.define))
  ),
  externals: config.externals
})

module.exports = webpackConfig
