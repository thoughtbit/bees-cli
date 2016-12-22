const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.config')
const paths = require('./paths')
const getConfig = require('./../utils/getConfig')
const cssLoaders = require('../utils/getCSSLoaders')

const config = getConfig()

console.log('loaders:', cssLoaders.styleLoaders({ sourceMap: config.cssSourceMap }))

module.exports = merge(baseWebpackConfig, {
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
