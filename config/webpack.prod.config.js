const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const baseWebpackConfig = require('./webpack.base.config')
const paths = require('./paths')
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
      sourceMap: paths.productionSourceMap,
      extract: true
    })
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    // 排除相似的或相同的，避免在最终生成的文件中出现重复的模块。
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true, // React doesn't support IE8
        warnings: false
      },
      mangle: {
        screw_ie8: true
      },
      output: {
        comments: false,
        screw_ie8: true
      }
    }),
    // 按引用频度来排序 ID，以便达到减少文件大小的效果
    new webpack.optimize.OccurenceOrderPlugin(),
    // extract css into its own file
    new ExtractTextPlugin(paths.getPath.assetsPath(paths.assetsSubDirectory, '[name].css')),
    // 公用的模块分开打包
    // split vendor js into its own file
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
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
      chunks: ['vendor']
    })
  ]
})

if (paths.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        paths.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

module.exports = webpackConfig
