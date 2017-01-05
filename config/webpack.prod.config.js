const os = require('os')
const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const UglifyJsParallelPlugin = require('webpack-uglify-parallel')
const baseWebpackConfig = require('./webpack.base.config')
const getConfig = require('../utils/getConfig')
const cssLoaders = require('../utils/getCSSLoaders')

const config = getConfig()
const publicPath = config.publicPath || '/'

const webpackConfig = merge(baseWebpackConfig, {
  bail: true,
  output: {
    publicPath: publicPath
  },
  module: {
    loaders: cssLoaders.styleLoaders({
      sourceMap: config.cssSourceMap,
      extract: true
    })
  },
  plugins: [
    // 按引用频度来排序 ID，以便达到减少文件大小的效果
    new webpack.optimize.OccurrenceOrderPlugin(),
    // 排除相似的或相同的，避免在最终生成的文件中出现重复的模块。
    new webpack.optimize.DedupePlugin(),
    new UglifyJsParallelPlugin({
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
    }),
    // extract css into its own file
    new ExtractTextPlugin('[name].css')
  ]
})

if (config.multipage) {
  webpackConfig.plugins.push(
    // 公用的模块分开打包
    // split vendor js into its own file
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common',
      minChunks: function (module, count) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      chunks: ['common']
    })
  )
}

if (config.isGzip) {
  const gzipExtensions = config.gzipExtensions || ['js', 'css']
  const CompressionWebpackPlugin = require('compression-webpack-plugin')
  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        gzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.analyze) {
  const Visualizer = require('webpack-visualizer-plugin')
  webpackConfig.plugins.push(new Visualizer())
}

module.exports = webpackConfig
