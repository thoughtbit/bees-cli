import fs from 'fs'
import autoprefixer from 'autoprefixer'
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import WatchMissingNodeModulesPlugin from 'react-dev-utils/WatchMissingNodeModulesPlugin'
import FriendlyErrors from 'friendly-errors-webpack-plugin'
import webpack from 'webpack'
import merge from 'webpack-merge'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import baseWebpackConfig from './webpack.config.base'
import getPaths from './paths'
import getEntry from '../utils/getEntry'
import getCSSLoaders from './../utils/getCSSLoaders'
import normalizeDefine from './../utils/normalizeDefine'

export default function (config, cwd) {
  const publicPath = '/'
  const paths = getPaths(cwd)
  const styleLoaders = getCSSLoaders.styleLoaders({ sourceMap: config.cssSourceMap })
  const commonConfig = baseWebpackConfig(config, paths)

  return merge(commonConfig, {
    devtool: 'cheap-module-source-map',
    entry: getEntry(config, paths.appDirectory),
    output: {
      path: paths.appBuild,
      filename: '[name].js',
      pathinfo: true,
      publicPath
    },
    module: {
      loaders: styleLoaders
    },
    babel: {
      babelrc: false
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
          'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        }
      }),
      new webpack.HotModuleReplacementPlugin(),
      new CaseSensitivePathsPlugin(),
      new WatchMissingNodeModulesPlugin(paths.appNodeModules),
      new webpack.NoErrorsPlugin(),
      new FriendlyErrors()
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
}
