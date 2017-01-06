const os = require('os')
const fs = require('fs')
const webpack = require('webpack')
const merge = require('webpack-merge')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const UglifyJsParallelPlugin = require('webpack-uglify-parallel')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const baseWebpackConfig = require('./webpack.base.config')
const paths = require('./paths')
const getConfig = require('../utils/getConfig')
const cssLoaders = require('../utils/getCSSLoaders')
const normalizeDefine = require('../utils/normalizeDefine')

const config = getConfig()
const publicPath = config.publicPath || '/'

module.exports = function (args, appBuild) {
  const { debug } = args
  const NODE_ENV = debug ? 'development' : process.env.NODE_ENV

  const webpackConfig = merge(baseWebpackConfig, {
    bail: true,
    output: {
      path: appBuild,
      publicPath: publicPath
    },
    module: {
      loaders: cssLoaders.styleLoaders({
        sourceMap: config.cssSourceMap,
        extract: true
      })
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify(NODE_ENV)
        }
      }),
      // 按引用频度来排序 ID，以便达到减少文件大小的效果
      new webpack.optimize.OccurrenceOrderPlugin(),
      // 排除相似的或相同的，避免在最终生成的文件中出现重复的模块。
      new webpack.optimize.DedupePlugin(),
      // extract css into its own file
      new ExtractTextPlugin('[name].css')
    ].concat(
      debug ? [] : new UglifyJsParallelPlugin({
        workers: os.cpus().length,
        compress: {
          screw_ie8: true, // React doesn't support IE8
          warnings: false
        },
        mangle: {
          screw_ie8: true
        },
        output: {
          ascii_only: true,
          comments: false,
          screw_ie8: true
        },
        sourceMap: false
      })
    ).concat(
      !config.analyze ? [] : new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false
      })
    ).concat(
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

  return webpackConfig
}
