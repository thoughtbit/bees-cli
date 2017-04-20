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
// import AddAssetHtmlPlugin from 'add-asset-html-webpack-plugin'
import baseWebpackConfig from './webpack.config.base'
import getPaths from './paths'
import getEntry from './../utils/getEntry'
import getCSSLoaders from './../utils/getCSSLoaders'
import normalizeDefine from './../utils/normalizeDefine'

export default function (config, cwd) {
  const publicPath = '/'
  const paths = getPaths(cwd)
  const styleLoaders = getCSSLoaders.styleLoaders(config, {
    sourceMap: config.cssSourceMap
  })
  config.vueLoaders = getCSSLoaders.cssLoaders(config, {
    sourceMap: config.cssSourceMap,
    extract: false
  })
  const dllPlugins = config.dllPlugin ? [
    new webpack.DllReferencePlugin({
      context: paths.appSrc,
      manifest: require(paths.dllManifest) // eslint-disable-line
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
    devtool: 'cheap-module-source-map',
    entry: getEntry(config, paths.appDirectory),
    output: {
      path: paths.appBuild,
      filename: '[name].js',
      pathinfo: true,
      publicPath,
      chunkFilename: '[id].async.js'
    },
    module: {
      rules: styleLoaders
    },
    plugins: [
      new webpack.DefinePlugin({
        '__VERSION__': JSON.stringify(paths.appPackageJson.version),
        'process.env': {
          'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        }
      }),
      new webpack.LoaderOptionsPlugin({
        options: {
          babel: {
            babelrc: false,
            presets: [
              [require.resolve('babel-preset-es2015'), { modules: false }],
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
          }
        }
      }),
      new webpack.HotModuleReplacementPlugin(),
      new CaseSensitivePathsPlugin(),
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
      !config.multipage ? [] : new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: function (module, count) {
          // any required modules inside node_modules are extracted to vendor
          return (
            module.resource && /\.js$/.test(module.resource) &&
            module.resource.indexOf(join(__dirname, '../node_modules')) === 0
          )
        }
      })
    ).concat(
      !config.multipage ? [] : new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest',
        chunks: ['vendor']
      }),
    ).concat(
      !config.define ? [] : new webpack.DefinePlugin(normalizeDefine(config.define))
    ),
    externals: config.externals
  })
  return webpackConfig
}
