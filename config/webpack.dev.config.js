const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.config')
const paths = require('./paths')
const getConfig = require('./../utils/getConfig')
const cssLoaders = require('../utils/getCSSLoaders')

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
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new CaseSensitivePathsPlugin(),
    new WatchMissingNodeModulesPlugin(paths.appNodeModules)
  ]
})

if (config.multipage) {
  webpackConfig.plugins.push(
    // 公用的模块分开打包
    // new webpack.optimize.CommonsChunkPlugin('common', 'common.js')
    new webpack.optimize.CommonsChunkPlugin({ name: 'common' })
  )
}

module.exports = webpackConfig
