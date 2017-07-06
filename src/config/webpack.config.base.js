import webpack from 'webpack'
import { existsSync } from 'fs'
import { join } from 'path'
import ModuleScopePlugin from 'react-dev-utils/ModuleScopePlugin'
import autoprefixer from 'autoprefixer'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import NpmInstallPlugin from 'npm-install-webpack-plugin-steamer'
import ManifestPlugin from 'webpack-manifest-plugin'
import SWPrecacheWebpackPlugin from 'sw-precache-webpack-plugin'
import SwRegisterWebpackPlugin from 'sw-register-webpack-plugin'
import normalizeDefine from './../utils/normalizeDefine'

export const defaultDevtool = '#cheap-module-eval-source-map'

export default function baseWebpackConfig (config, paths) {
  return {
    context: paths.appSrc,
    resolve: {
      // This allows you to set a fallback for where Webpack should look for modules.
      // We read `NODE_PATH` environment variable in `paths.js` and pass paths here.
      // We placed these paths second because we want `node_modules` to "win"
      // if there are any conflicts. This matches Node resolution mechanism.
      // https://github.com/facebookincubator/create-react-app/issues/253
      modules: [paths.appSrc, 'node_modules', paths.appNodeModules].concat(paths.nodePaths),
      extensions: [
        ...(config.extraResolveExtensions || []),
        '.js', '.json', '.jsx', '.ts', '.tsx', '.vue'
      ],
      alias: {
        '~': paths.appSrc
      },
      plugins: [
        // Prevents users from importing files from outside of src/ (or node_modules/).
        // This often causes confusion because we only process files within src/ with babel.
        // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
        // please link the files into your node_modules/ and let module-resolution kick in.
        // Make sure your source files are compiled, as they will not be processed in any way.
        new ModuleScopePlugin(paths.appSrc)
      ]
    },
    // Resolve loaders (webpack plugins for CSS, images, transpilation) from the
    // directory of `bees-cli` itself rather than the project directory.
    resolveLoader: {
      modules: [
        paths.ownNodeModules,
        // Lerna hoists everything, so we need to look in our app directory
        paths.appNodeModules
      ]
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          include: paths.appSrc,
          loader: 'babel-loader',
          options: {
            cacheDirectory: './.webpack_cache/'
          }
        },
        {
          test: /\.tsx?$/,
          include: paths.appSrc,
          loader: 'ts-loader',
          options: {
            cacheDirectory: './.webpack_cache/',
            appendTsSuffixTo: [/\.vue$/]
          }
        },
        // "file" loader makes sure those assets get served by WebpackDevServer.
        // When you `import` an asset, you get its (virtual) filename.
        // In production, they would get copied to the `build` folder.
        {
          exclude: [
            /\.html$/,
            /\.(js|jsx)$/,
            /\.(ts|tsx)$/,
            /\.vue$/,
            /\.json$/,
            /\.(css|less|sass|scss|styl)$/,
            /\.bmp$/,
            /\.gif$/,
            /\.jpe?g$/,
            /\.png$/,
            /\.svg$/
          ],
          loader: 'file-loader',
          options: {
            name: 'static/[name].[hash:8].[ext]'
          }
        },
        {
          test: /\.html$/,
          loader: 'file-loader',
          query: {
            name: '[name].[ext]'
          }
        }
      ]
    },
    node: {
      fs: 'empty',
      net: 'empty',
      tls: 'empty'
    }
  }
}

export function getBabelOptions (config) {
  return {
    babelrc: false,
    presets: [
      [require.resolve('babel-preset-es2015'), { modules: false }],
      require.resolve('babel-preset-stage-2')
    ].concat(config.extraBabelPresets || []),
    plugins: [
      require.resolve('babel-plugin-transform-runtime')
    ].concat(config.extraBabelPlugins || []),
    cacheDirectory: './.webpack_cache/'
  }
}

export function getPostCSSOptions (config) {
  return [
    autoprefixer(config.autoprefixer || {
      browsers: [
        '>1%',
        'last 4 versions',
        'Firefox ESR',
        'not ie < 9' // React doesn't support IE8 anyway
      ]
    }),
    ...(config.extraPostCSSPlugins ? config.extraPostCSSPlugins : [])
  ]
}

export function getCommonPlugins ({ config, paths, appBuild, NODE_ENV }) {
  const ret = [
    // 3.0 新功能 范围提升 （Scope Hoisting )
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.LoaderOptionsPlugin({
      options: {
        babel: getBabelOptions(config),
        postcss: getPostCSSOptions(config)
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
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ]

  let defineObj = {
    'process.env': {
      NODE_ENV: JSON.stringify(NODE_ENV)
    }
  }

  if (config.define) {
    defineObj = {
      ...defineObj,
      ...normalizeDefine(config.define)
    }
  }

  ret.push(new webpack.DefinePlugin(defineObj))

  if (existsSync(paths.appPublic)) {
    ret.push(new CopyWebpackPlugin([
      {
        from: paths.appPublic,
        to: appBuild
      }
    ]))
  }

  if (config.multipage) {
    ret.push(new webpack.optimize.CommonsChunkPlugin({
      name: 'common',
      filename: 'common.js'
    }))
  }

  return ret
}

export function getSWPlugins ({ config, paths }) {
  if (config.serviceWorker) {
    const appName = require(paths.appPackageJson).name
    const {
      cacheId = appName,
      templateFilePath
    } = config.serviceWorker

    const swPrecache = {
      cacheId,
      dontCacheBustUrlsMatching: /\.\w{8}\./,
      filename: 'service-worker.js',
      logger (message) {
        if (message.indexOf('Total precache size is') === 0) {
          return
        }
        if (message.indexOf('Skipping static resource') === 0) {
          return
        }
        console.log(message)
      },
      /* 需缓存的文件配置
        需动态缓存的放到runtimeCaching中处理 */
      staticFileGlobs: [],

      /* webpack生成的静态资源全部缓存 */
      mergeStaticsConfig: true,

      /* 忽略的文件 */
      staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],

      /* 需要省略掉的前缀名 */
      stripPrefix: 'dist/',

      /* 当请求路径不在缓存里的返回，对于单页应用来说，入口点是一样的 */
      navigateFallback: '/index.html',

      /* 白名单包含所有的.html (for HTML imports) 和
        路径中含’/data/’(for dynamically-loaded data). */
      navigateFallbackWhitelist: [/^(?!.*\.html$|\/data\/).*/],

      minify: true, // 是否压缩，默认不压缩

      // maximumFileSizeToCacheInBytes: 4194304, // 最大缓存大小

      /* 生成service-worker.js的文件配置模板，不配置时采用默认的配置
          本demo做了sw的更新策略，所以在原有模板基础做了相应的修改 */
      templateFilePath: paths.resolveApp(templateFilePath),
      verbose: true,
      // 需要根据路由动态处理的文件
      runtimeCaching: [
        {
          urlPattern: /\/material-design-icon/,
          handler: 'networkFirst'
        },
        {
          urlPattern: /\/pwa\.baidu\.com/,
          handler: 'networkFirst'
        },
        {
          urlPattern: /\/vue\//,
          handler: 'networkFirst'
        }
        // ,
        // 如果在staticFileGlobs中设置相同的缓存路径，可能导致此处不起作用
        // {
        //     urlPattern: /\/fonts\//,
        //     handler: 'networkFirst',
        //     options: {
        //         cache: {
        //             maxEntries: 10,
        //             name: 'fonts-cache'
        //         }
        //     }
        // }
      ]
    }

    return [
      new ManifestPlugin({
        fileName: 'asset-manifest.json'
      }),
      new SWPrecacheWebpackPlugin(swPrecache)
      // new SwRegisterWebpackPlugin({
      //   filePath: join(paths.appBuild, 'service-worker.js')
      // })
    ]
  } else {
    return []
  }
}
