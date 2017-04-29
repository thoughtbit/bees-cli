import fs from 'fs'
import { join } from 'path'
import autoprefixer from 'autoprefixer'
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import WatchMissingNodeModulesPlugin from 'react-dev-utils/WatchMissingNodeModulesPlugin'
import FriendlyErrors from 'friendly-errors-webpack-plugin'
import webpack from 'webpack'
import merge from 'webpack-merge'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
// import HtmlWebpackPlugin from 'html-webpack-plugin'
import baseWebpackConfig from './webpack.config.base'
import getPaths from './paths'
import getEntry from './../utils/getEntry'
import getCSSLoaders from './../utils/getCSSLoaders'
import normalizeDefine from './../utils/normalizeDefine'

export default function (config, cwd) {
  const publicPath = '/'
  const {
    library = null,
    libraryTarget = 'var',
    devtool = '#cheap-module-eval-source-map'
  } = config
  const paths = getPaths(cwd)
  const styleLoaders = getCSSLoaders.styleLoaders(config, {
    sourceMap: config.cssSourceMap
  })
  config.vueLoaders = getCSSLoaders.cssLoaders(config, {
    sourceMap: config.cssSourceMap,
    extract: false
  })
  const output = {
    path: paths.appBuild,
    filename: '[name].js',
    pathinfo: true,
    publicPath,
    libraryTarget,
    chunkFilename: '[id].async.js'
  }

  if (library) output.library = library

  const dllPlugins = config.dllPlugin ? [
    new webpack.DllReferencePlugin({
      context: paths.appSrc,
      manifest: require(join(paths.dllNodeModule, `${config.dllPlugin.name}.json`),) // eslint-disable-line
    }),
    new CopyWebpackPlugin([
      {
        from: join(paths.dllNodeModule, `${config.dllPlugin.name}.dll.js`),
        to: join(paths.appBuild, `${config.dllPlugin.name}.dll.js`)
      }
    ])
  ] : []

  const commonConfig = baseWebpackConfig(config, paths)
  const webpackConfig = merge(commonConfig, {
    devtool,
    entry: getEntry(config, paths.appDirectory),
    output,
    module: {
      rules: styleLoaders
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        }
      }),
      new webpack.LoaderOptionsPlugin({
        options: {
          babel: {
            babelrc: false,
            presets: [
              require.resolve('babel-preset-es2015'),
              require.resolve('babel-preset-stage-2')
            ].concat(config.extraBabelPresets || []),
            plugins: [
              require.resolve('babel-plugin-transform-runtime')
            ].concat(config.extraBabelPlugins || []),
            cacheDirectory: true
          },
          postcss () {
            return [
              autoprefixer(config.autoprefixer || {
                browsers: [
                  '>1%',
                  'last 4 versions',
                  'not ie <= 8'
                ]
              })
            ].concat(config.extraPostCSSPlugins ? config.extraPostCSSPlugins : [])
          }
        }
      }),
      // This is necessary to emit hot updates (currently CSS only):
      new webpack.HotModuleReplacementPlugin(),
      // Watcher doesn't work well if you mistype casing in a path so we use
      // a plugin that prints an error when you attempt to do this.
      new CaseSensitivePathsPlugin(),
      // If you require a missing module and then `npm install` it, you still have
      // to restart the development server for Webpack to discover it. This plugin
      // makes the discovery automatic so you don't have to restart.
      new WatchMissingNodeModulesPlugin(paths.appNodeModules),
      // 取代 system-bell-webpack-plugin
      new FriendlyErrors()
    ].concat(
      dllPlugins,
    ).concat(
      !config.analyze ? [] : new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
        reportFilename: paths.resolveOwn(`../reports/${process.env.NODE_ENV}.html`)
      })
    ).concat(
      !fs.existsSync(paths.appPublic) ? [] : new CopyWebpackPlugin([{
        from: paths.appPublic,
        to: paths.appBuild
      }])
    ).concat(
      !config.multipage ? [] : new webpack.optimize.CommonsChunkPlugin({name: 'common', filename: 'common.js'})
    ).concat(
      !config.define ? [] : new webpack.DefinePlugin(normalizeDefine(config.define))
    ),
    // 开发环境中没必要开启性能警告提示，反而影响速度.
    performance: {
      hints: false
    },
    externals: config.externals
  })
  return webpackConfig
}
