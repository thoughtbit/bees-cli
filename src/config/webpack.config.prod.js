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
import rollupBabel from 'rollup-plugin-babel'
import babelrc from 'babelrc-rollup'
import rollupResolve from 'rollup-plugin-node-resolve'
import rollupVue from 'rollup-plugin-vue'
import rollupJsx from 'rollup-plugin-jsx'
// import rollupBuble from 'rollup-plugin-buble')
import rollupReplace from 'rollup-plugin-replace'
import rollupCommonjs from 'rollup-plugin-commonjs'
import getEntry from './../utils/getEntry'
import baseWebpackConfig from './webpack.config.base'
import getCSSLoaders from './../utils/getCSSLoaders'
import normalizeDefine from './../utils/normalizeDefine'

export default function (args, appBuild, config, paths) {
  const { debug } = args
  const NODE_ENV = debug ? 'development' : process.env.NODE_ENV

  const {
    publicPath = '/',
    library = null,
    libraryTarget = 'var'
  } = config

  const styleLoaders = getCSSLoaders.styleLoaders(config, {
    sourceMap: config.cssSourceMap,
    extract: true
  })

  const output = {
    path: appBuild,
    filename: '[name].js',
    publicPath,
    libraryTarget,
    chunkFilename: '[id].async.js'
  }

  if (library) output.library = library

  const commonConfig = baseWebpackConfig(config, paths)

  const webpackConfig = merge(commonConfig, {
    bail: true,
    entry: getEntry(config, paths.appDirectory, /* isBuild */ true),
    output: {
      path: appBuild,
      filename: '[name].js',
      publicPath,
      chunkFilename: '[id].async.js'
    },
    module: {
      rules: styleLoaders
    },
    plugins: [
      new webpack.DefinePlugin({
        '__VERSION__': JSON.stringify(paths.appPackageJson.version),
        APP_NAME: JSON.stringify(paths.appPackageJson.name)
      }),
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify(NODE_ENV)
        }
      }),
      new webpack.LoaderOptionsPlugin({
        options: {
          babel: {
            babelrc: false,
            presets: [
              [require.resolve('babel-preset-env'), { modules: false }],
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
                  'Firefox ESR',
                  'not ie < 9'
                ]
              })
            ].concat(config.extraPostCSSPlugins ? config.extraPostCSSPlugins : [])
          }
        }
      }),
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
        sourceMap: true
      })
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
    externals: config.externals
  })

  webpackConfig.module.loaders.push({
    test: /\.(js|jsx|vue)$/,
    exclude: /\/node_modules\//,
    loader: 'rollup-loader',
    options: {
      external: false,
      plugins: [
        rollupResolve(),
        rollupCommonjs(),
        rollupVue({
          compileTemplate: true
        }),
        rollupJsx({ factory: 'h' }),
        rollupReplace(Object.assign(
          {
            __VERSION__: paths.appPackageJson.version
          },
          {
            'process.env': {
              'NODE_ENV': JSON.stringify(NODE_ENV)
            }
          }
        )),
        // rollupBuble(),
        rollupBabel(babelrc())
      ]
    }
  })

  return webpackConfig
}
