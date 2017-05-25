import fs from 'fs'
import { join } from 'path'
import autoprefixer from 'autoprefixer'
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import WatchMissingNodeModulesPlugin from 'react-dev-utils/WatchMissingNodeModulesPlugin'
import webpack from 'webpack'
import merge from 'webpack-merge'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import NpmInstallPlugin from 'npm-install-webpack-plugin-steamer'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import baseWebpackConfig from './webpack.config.base'
import getPaths from './paths'
import getEntry from './../utils/getEntry'
import getCSSLoaders from './../utils/getCSSLoaders'
import normalizeDefine from './../utils/normalizeDefine'

export default function (config, cwd) {
  const env = process.env.NODE_ENV
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

  const vueStyleLoaderMap = getCSSLoaders.cssLoaders(config, {
    sourceMap: config.cssSourceMap
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
      manifest: require(join(paths.dllNodeModule, `${config.dllPlugin.name}.json`)) // eslint-disable-line
    }),
    new CopyWebpackPlugin([
      {
        from: join(paths.dllNodeModule, `${config.dllPlugin.name}.dll.js`),
        to: join(paths.appBuild, `${config.dllPlugin.name}.dll.js`)
      }
    ])
  ] : []

  const commonConfig = baseWebpackConfig(config, paths)

  // "url" loader works like "file" loader except that it embeds assets
  // smaller than specified limit in bytes as data URLs to avoid requests.
  // A missing `test` is equivalent to a match.
  const imageLoader = {
    test: [/\.jpe?g$/, /\.png$/, /\.gif$/, /\.svg$/],
    loaders: [
      {
        loader: 'url-loader',
        query: {
          limit: 10000,
          name: 'static/[name].[hash:8].[ext]'
        }
      }
    ]
  }

  commonConfig.module.rules.push(imageLoader)

  if (config.use === 'vue') {
    commonConfig.resolve.alias['vue$'] = 'vue/dist/vue.esm.js'

    // vue-loader的样式loader配置
    const vueLoader = {
      test: /\.vue$/,
      loader: 'vue-loader',
      include: paths.appSrc,
      options: {
        loaders: {}
      }
    }

    /*
      // 预编译器，默认支持css 和 less. sass, scss 和 stylus 由npm-install-webpack-plugin自动安装
      style: ["css", "less"]
    */
    config.style.forEach((style) => {
      vueLoader.options.loaders[style] = vueStyleLoaderMap[style]
      let rule = styleLoaders[style] || ''
      rule && commonConfig.module.rules.push(rule)
    })
    commonConfig.module.rules.push(vueLoader)
  } else {
    config.style.forEach((style) => {
      let rule = styleLoaders[style] || ''
      rule && commonConfig.module.rules.push(rule)
    })
  }

  const webpackConfig = merge(commonConfig, {
    devtool,
    entry: getEntry(config, paths),
    output,
    plugins: [
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.LoaderOptionsPlugin({
        options: {
          babel: {
            babelrc: false,
            presets: [
              [require.resolve('babel-preset-es2015'), { modules: false }],
              require.resolve('babel-preset-stage-2')
            ].concat(config.extraBabelPresets || []),
            plugins: [
              require.resolve('babel-plugin-transform-runtime')
            ].concat(config.extraBabelPlugins || []),
            cacheDirectory: './.webpack_cache/'
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
      new NpmInstallPlugin({
        // Use --save or --save-dev
        dev: true,
        // Install missing peerDependencies
        peerDependencies: true,
        // Reduce amount of console logging
        quiet: false
      }),
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify(env)
        }
      }),
      // extract css into its own file
      new ExtractTextPlugin({
        filename: '[name].css',
        allChunks: false,
        disable: true
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
      // Moment.js is an extremely popular library that bundles large locale files
      // by default due to how Webpack interprets its code. This is a practical
      // solution that requires the user to opt into importing specific locales.
      // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
      // You can remove this if you don't use Moment.js:
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ].concat(
      dllPlugins,
    ).concat(
      !config.analyze ? [] : new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
        reportFilename: paths.resolveOwn(`../reports/${env}.html`)
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
    externals: config.externals,
    watch: true
  })
  // console.log(webpackConfig)
  // console.log(JSON.stringify(webpackConfig, null, 2))
  return webpackConfig
}
