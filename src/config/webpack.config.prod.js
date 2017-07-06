import os from 'os'
import { join } from 'path'
import webpack from 'webpack'
import merge from 'webpack-merge'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import UglifyJsParallelPlugin from 'webpack-uglify-parallel'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import WebpackMd5Hash from 'webpack-md5-hash'

import getEntry from './../utils/getEntry'
import baseWebpackConfig, {
  defaultDevtool,
  getCommonPlugins,
  getSWPlugins
} from './webpack.config.base'
import getCSSLoaders from './../utils/getCSSLoaders'

export default function (args, appBuild, config, paths) {
  const env = process.env.NODE_ENV
  const isWindows = (os.type() === 'Windows_NT')
  const { debug } = args
  const NODE_ENV = debug ? 'development' : env

  const {
    publicPath = '/',
    library = null,
    libraryTarget = 'var',
    devtool = debug ? defaultDevtool : false
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
    chunkFilename: '[name].async.js',
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
      new WebpackMd5Hash(),
      // extract css into its own file
      new ExtractTextPlugin({
        filename: '[name].css',
        allChunks: false,
        disable: false
      }),
      ...getCommonPlugins({
        config,
        paths,
        appBuild: paths.appBuild,
        NODE_ENV: NODE_ENV
      }),
      ...(debug ? [] : [new UglifyJsParallelPlugin({
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
      })]),
      ...(config.analyze ? [new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false
      })] : []),
      ...getSWPlugins(config, paths)
    ],
    externals: config.externals
  })
  // console.log(webpackConfig)
  // console.log(JSON.stringify(webpackConfig, null, 2))
  return webpackConfig
}
