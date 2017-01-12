import fs from 'fs'
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import WatchMissingNodeModulesPlugin from 'react-dev-utils/WatchMissingNodeModulesPlugin'
import FriendlyErrors from 'friendly-errors-webpack-plugin'
import webpack from 'webpack'
import merge from 'webpack-merge'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import baseWebpackConfig from './webpack.base.config'
import getPaths from './paths'
import getCSSLoaders from '../utils/getCSSLoaders'
import normalizeDefine from '../utils/normalizeDefine'

export default function (config, cwd) {
  const paths = getPaths(cwd)

  const styleLoaders = getCSSLoaders.styleLoaders({ sourceMap: config.cssSourceMap })
  const commonConfig = baseWebpackConfig(config, paths)

  return merge(commonConfig, {
    devtool: 'cheap-module-source-map',
    output: {
      pathinfo: true
    },
    module: {
      loaders: styleLoaders
    },
    babel: {
      babelrc: false
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
