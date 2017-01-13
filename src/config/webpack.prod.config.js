import os from 'os'
import fs from 'fs'
import autoprefixer from 'autoprefixer'
import webpack from 'webpack'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import UglifyJsParallelPlugin from 'webpack-uglify-parallel'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import getEntry from '../utils/getEntry'
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

  return {
    bail: true,
    entry: getEntry(config, paths.appDirectory),
    output: {
      path: appBuild,
      filename: '[name].js',
      publicPath
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
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          loader: 'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
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
      ].concat(styleLoaders)
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
    externals: config.externals,
    node: {
      fs: 'empty',
      net: 'empty',
      tls: 'empty'
    }
  }
}
