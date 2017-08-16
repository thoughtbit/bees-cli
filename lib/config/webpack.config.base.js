'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultDevtool = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.default = baseWebpackConfig;
exports.getBabelOptions = getBabelOptions;
exports.getPostCSSOptions = getPostCSSOptions;
exports.getCommonPlugins = getCommonPlugins;
exports.getSWPlugins = getSWPlugins;

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _fs = require('fs');

var _path = require('path');

var _ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

var _ModuleScopePlugin2 = _interopRequireDefault(_ModuleScopePlugin);

var _autoprefixer = require('autoprefixer');

var _autoprefixer2 = _interopRequireDefault(_autoprefixer);

var _copyWebpackPlugin = require('copy-webpack-plugin');

var _copyWebpackPlugin2 = _interopRequireDefault(_copyWebpackPlugin);

var _webpackBundleAnalyzer = require('webpack-bundle-analyzer');

var _npmInstallWebpackPluginSteamer = require('npm-install-webpack-plugin-steamer');

var _npmInstallWebpackPluginSteamer2 = _interopRequireDefault(_npmInstallWebpackPluginSteamer);

var _webpackManifestPlugin = require('webpack-manifest-plugin');

var _webpackManifestPlugin2 = _interopRequireDefault(_webpackManifestPlugin);

var _swPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');

var _swPrecacheWebpackPlugin2 = _interopRequireDefault(_swPrecacheWebpackPlugin);

var _swRegisterWebpackPlugin = require('sw-register-webpack-plugin');

var _swRegisterWebpackPlugin2 = _interopRequireDefault(_swRegisterWebpackPlugin);

var _normalizeDefine = require('./../utils/normalizeDefine');

var _normalizeDefine2 = _interopRequireDefault(_normalizeDefine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const defaultDevtool = exports.defaultDevtool = '#cheap-module-eval-source-map';

function baseWebpackConfig(config, paths) {
  return {
    context: paths.appSrc,
    resolve: {
      // This allows you to set a fallback for where Webpack should look for modules.
      // We read `NODE_PATH` environment variable in `paths.js` and pass paths here.
      // We placed these paths second because we want `node_modules` to "win"
      // if there are any conflicts. This matches Node resolution mechanism.
      // https://github.com/facebookincubator/create-react-app/issues/253
      modules: [paths.appSrc, 'node_modules', paths.appNodeModules].concat(paths.nodePaths),
      extensions: [...(config.extraResolveExtensions || []), '.js', '.json', '.jsx', '.ts', '.tsx', '.vue'],
      alias: {
        '~': paths.appSrc
      },
      plugins: [
      // Prevents users from importing files from outside of src/ (or node_modules/).
      // This often causes confusion because we only process files within src/ with babel.
      // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
      // please link the files into your node_modules/ and let module-resolution kick in.
      // Make sure your source files are compiled, as they will not be processed in any way.
      new _ModuleScopePlugin2.default(paths.appSrc)]
    },
    // Resolve loaders (webpack plugins for CSS, images, transpilation) from the
    // directory of `bees-cli` itself rather than the project directory.
    resolveLoader: {
      modules: [paths.ownNodeModules,
      // Lerna hoists everything, so we need to look in our app directory
      paths.appNodeModules]
    },
    module: {
      rules: [{
        test: /\.jsx?$/,
        include: paths.appSrc,
        loader: 'babel-loader',
        options: {
          cacheDirectory: './.webpack_cache/'
        }
      }, {
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
        exclude: [/\.html$/, /\.(js|jsx)$/, /\.(ts|tsx)$/, /\.vue$/, /\.json$/, /\.(css|less|sass|scss|styl)$/, /\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
        loader: 'file-loader',
        options: {
          name: 'static/[name].[hash:8].[ext]'
        }
      }, {
        test: /\.html$/,
        loader: 'file-loader',
        query: {
          name: '[name].[ext]'
        }
      }]
    },
    node: {
      fs: 'empty',
      net: 'empty',
      tls: 'empty'
    }
  };
}

function getBabelOptions(config) {
  return {
    babelrc: false,
    presets: [
    // Latest stable ECMAScript features
    [require.resolve('babel-preset-env'), {
      targets: {
        // React parses on ie 9, so we should too
        ie: 9,
        // We currently minify with uglify
        // Remove after https://github.com/mishoo/UglifyJS2/issues/448
        uglify: true
      },
      // Disable polyfill transforms
      useBuiltIns: false,
      // Do not transform modules to CJS
      modules: false
    }], require.resolve('babel-preset-stage-0')].concat(config.extraBabelPresets || []),
    plugins: [
    // class { handleClick = () => { } }
    require.resolve('babel-plugin-transform-class-properties'),
    // Polyfills the runtime needed for async/await and generators
    [require.resolve('babel-plugin-transform-runtime'), {
      helpers: false,
      polyfill: false,
      regenerator: true
    }], require.resolve('babel-plugin-syntax-dynamic-import')].concat(config.extraBabelPlugins || []),
    cacheDirectory: './.webpack_cache/'
  };
}

function getPostCSSOptions(config) {
  return [(0, _autoprefixer2.default)(config.autoprefixer || {
    browsers: ['>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9' // React doesn't support IE8 anyway
    ]
  }), ...(config.extraPostCSSPlugins ? config.extraPostCSSPlugins : [])];
}

function getCommonPlugins({ config, paths, appBuild, NODE_ENV }) {
  const ret = [new _webpack2.default.NoEmitOnErrorsPlugin(), new _webpack2.default.LoaderOptionsPlugin({
    options: {
      babel: getBabelOptions(config),
      postcss: getPostCSSOptions(config)
    }
  }), new _npmInstallWebpackPluginSteamer2.default({
    // Use --save or --save-dev
    dev: true,
    // Install missing peerDependencies
    peerDependencies: true,
    // Reduce amount of console logging
    quiet: false
  }), new _webpack2.default.IgnorePlugin(/^\.\/locale$/, /moment$/)];

  let defineObj = {
    'process.env': {
      NODE_ENV: (0, _stringify2.default)(NODE_ENV)
    }
  };

  if (config.define) {
    defineObj = (0, _extends3.default)({}, defineObj, (0, _normalizeDefine2.default)(config.define));
  }

  ret.push(new _webpack2.default.DefinePlugin(defineObj));

  if ((0, _fs.existsSync)(paths.appPublic)) {
    ret.push(new _copyWebpackPlugin2.default([{
      from: paths.appPublic,
      to: appBuild
    }]));
  }

  if (config.multipage) {
    // Support hash
    const name = config.hash ? 'common.[hash]' : 'common';
    ret.push(new _webpack2.default.optimize.CommonsChunkPlugin({
      name: 'common',
      filename: `${name}.js`
    }));
  }

  return ret;
}

function getSWPlugins({ config, paths }) {
  if (config.serviceWorker) {
    const appName = require(paths.appPackageJson).name;
    const {
      cacheId = appName,
      templateFilePath
    } = config.serviceWorker;

    const swPrecache = {
      cacheId,
      dontCacheBustUrlsMatching: /\.\w{8}\./,
      filename: 'service-worker.js',
      logger(message) {
        if (message.indexOf('Total precache size is') === 0) {
          return;
        }
        if (message.indexOf('Skipping static resource') === 0) {
          return;
        }
        console.log(message);
      },
      /* 需缓存的文件配置
        需动态缓存的放到runtimeCaching中处理 */
      staticFileGlobs: [],

      /* webpack生成的静态资源全部缓存 */
      mergeStaticsConfig: true,

      /* 忽略的文件 */
      staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],

      /* 需要省略掉的前缀名 */
      // stripPrefix: 'dist/',

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
      runtimeCaching: [{
        urlPattern: /\/vue\//,
        handler: 'networkFirst'
      },
      // 如果在staticFileGlobs中设置相同的缓存路径，可能导致此处不起作用
      {
        urlPattern: /\/fonts\//,
        handler: 'networkFirst',
        options: {
          cache: {
            maxEntries: 10,
            name: 'fonts-cache'
          }
        }
      }]
    };

    return [new _webpackManifestPlugin2.default({
      fileName: 'asset-manifest.json'
    }), new _swPrecacheWebpackPlugin2.default(swPrecache)
    // new SwRegisterWebpackPlugin({
    //   filePath: join(paths.appBuild, 'service-worker.js')
    // })
    ];
  } else {
    return [];
  }
}