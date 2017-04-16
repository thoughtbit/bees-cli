import os from 'os'
import fs from 'fs'
import autoprefixer from 'autoprefixer'
import webpack from 'webpack'
import merge from 'webpack-merge'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import UglifyJsParallelPlugin from 'webpack-uglify-parallel'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import getEntry from '../utils/getEntry'
import baseWebpackConfig from './webpack.config.base'
import getCSSLoaders from './../utils/getCSSLoaders'
import normalizeDefine from './../utils/normalizeDefine'

export default function (args, appBuild, config, paths) {
  const { debug } = args
  const NODE_ENV = debug ? 'development' : process.env.NODE_ENV

  const publicPath = config.publicPath || '/'
  const styleLoaders = getCSSLoaders.styleLoaders({
    sourceMap: config.cssSourceMap,
    extract: true
  })

  const commonConfig = baseWebpackConfig(config, paths)

  return merge(commonConfig, {
    bail: true,
    entry: getEntry(config, paths.appDirectory),
    output: {
      path: appBuild,
      filename: '[name].js',
      publicPath
    },
    module: {
      loaders: styleLoaders
    },
    postcss () {
      return [
        autoprefixer(config.autoprefixer || {
          browsers: [
            '>1%',
            'last 4 versions',
            'Firefox ESR',
            'not ie < 9' // React doesn't support IE8 anyway
          ]
        })
      ].concat(config.extraPostCSSPlugins ? config.extraPostCSSPlugins : [])
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
}
