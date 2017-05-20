import os from 'os'
import fs from 'fs'
import { join } from 'path'
import autoprefixer from 'autoprefixer'
import webpack from 'webpack'
import merge from 'webpack-merge'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import UglifyJsParallelPlugin from 'webpack-uglify-parallel'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import NpmInstallPlugin from 'npm-install-webpack-plugin-steamer'
import WebpackMd5Hash from 'webpack-md5-hash'

import getEntry from './../utils/getEntry'
import baseWebpackConfig from './webpack.config.base'
import getCSSLoaders from './../utils/getCSSLoaders'
import normalizeDefine from './../utils/normalizeDefine'

export default function (args, appBuild, config, paths) {
  const env = process.env.NODE_ENV
  const isWindows = (os.type() === 'Windows_NT')
  const { debug } = args
  const NODE_ENV = debug ? 'development' : env

  const {
    publicPath = '/',
    library = null,
    libraryTarget = 'var'
  } = config

  const styleLoaders = getCSSLoaders.styleLoaders(config, {
    sourceMap: config.cssSourceMap
  })

  const vueStyleLoaderMap = getCSSLoaders.cssLoaders(config, {
    sourceMap: config.cssSourceMap
  })

  const output = {
    path: appBuild,
    filename: '[name].js',
    chunkFilename: '[id].async.js',
    publicPath,
    libraryTarget
  }

  if (library) output.library = library

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
          limit: 1000,
          name: 'static/[name].[hash:8].[ext]'
        }
      }
    ]
  }

  if (!isWindows) {
    if (config.imgCompress) {
      imageLoader.loaders.push({
        loader: 'image-webpack-loader',
        options: {
          gifsicle: {
            interlaced: false
          },
          optipng: {
            optimizationLevel: 7
          },
          pngquant: {
            quality: '65-90',
            speed: 4
          },
          mozjpeg: {
            progressive: true,
            quality: 65
          }
        }
      })
    }
  }

  commonConfig.module.rules.push(imageLoader)

  if (config.use === 'vue') {
    commonConfig.resolve.alias['vue$'] = 'vue/dist/vue.esm.js'

    // vue-loader的样式loader配置
    const vueLoader = {
      test: /\.vue$/,
      loader: 'vue-loader',
      options: {
        loaders: {}
      },
      exclude: /node_modules/
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
    // Don't attempt to continue if there are any errors.
    bail: true,
    entry: getEntry(config, paths, /* isBuild */ true),
    output,
    plugins: [
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.LoaderOptionsPlugin({
        options: {
          babel: {
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
          'NODE_ENV': JSON.stringify(NODE_ENV)
        }
      }),
      new WebpackMd5Hash(),
      // extract css into its own file
      new ExtractTextPlugin({
        filename: '[name].css',
        allChunks: false,
        disable: false
      })
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
        sourceMap: true
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
      !config.multipage ? [] : new webpack.optimize.CommonsChunkPlugin({name: 'common', filename: 'common.js'})
    ).concat(
      !config.define ? [] : new webpack.DefinePlugin(normalizeDefine(config.define))
    ),
    externals: config.externals
  })
  // console.log(webpackConfig)
  // console.log(JSON.stringify(webpackConfig, null, 2))
  return webpackConfig
}
