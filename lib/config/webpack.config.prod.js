'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.default = function (args, appBuild, config, paths) {
  var env = process.env.NODE_ENV;
  var isWindows = _os2.default.type() === 'Windows_NT';
  var debug = args.debug;

  var NODE_ENV = debug ? 'development' : env;

  var _config$publicPath = config.publicPath,
      publicPath = _config$publicPath === undefined ? '/' : _config$publicPath,
      _config$library = config.library,
      library = _config$library === undefined ? null : _config$library,
      _config$libraryTarget = config.libraryTarget,
      libraryTarget = _config$libraryTarget === undefined ? 'var' : _config$libraryTarget;


  var styleLoaders = _getCSSLoaders2.default.styleLoaders(config, {
    sourceMap: config.cssSourceMap
  });

  var vueStyleLoaderMap = _getCSSLoaders2.default.cssLoaders(config, {
    sourceMap: config.cssSourceMap
  });

  var output = {
    path: appBuild,
    filename: '[name].js',
    chunkFilename: '[id].async.js',
    publicPath: publicPath,
    libraryTarget: libraryTarget
  };

  if (library) output.library = library;

  var commonConfig = (0, _webpackConfig2.default)(config, paths);

  // "url" loader works like "file" loader except that it embeds assets
  // smaller than specified limit in bytes as data URLs to avoid requests.
  // A missing `test` is equivalent to a match.
  var imageLoader = {
    test: [/\.jpe?g$/, /\.png$/, /\.gif$/, /\.svg$/],
    loaders: [{
      loader: 'url-loader',
      query: {
        limit: 1000,
        name: 'static/[name].[hash:8].[ext]'
      }
    }]
  };

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
      });
    }
  }

  commonConfig.module.rules.push(imageLoader);

  if (config.use === 'vue') {
    commonConfig.resolve.alias['vue$'] = 'vue/dist/vue.esm.js';

    // vue-loader的样式loader配置
    var vueLoader = {
      test: /\.vue$/,
      loader: 'vue-loader',
      options: {
        loaders: {}
      },
      exclude: /node_modules/
    };

    /*
      // 预编译器，默认支持css 和 less. sass, scss 和 stylus 由npm-install-webpack-plugin自动安装
      style: ["css", "less"]
    */
    config.style.forEach(function (style) {
      vueLoader.options.loaders[style] = vueStyleLoaderMap[style];
      var rule = styleLoaders[style] || '';
      rule && commonConfig.module.rules.push(rule);
    });
    commonConfig.module.rules.push(vueLoader);
  } else {
    config.style.forEach(function (style) {
      var rule = styleLoaders[style] || '';
      rule && commonConfig.module.rules.push(rule);
    });
  }

  var webpackConfig = (0, _webpackMerge2.default)(commonConfig, {
    // Don't attempt to continue if there are any errors.
    bail: true,
    entry: (0, _getEntry2.default)(config, paths, /* isBuild */true),
    output: output,
    plugins: [new _webpack2.default.NoEmitOnErrorsPlugin(), new _webpack2.default.LoaderOptionsPlugin({
      options: {
        babel: {
          presets: [[require.resolve('babel-preset-es2015'), { modules: false }], require.resolve('babel-preset-stage-2')].concat(config.extraBabelPresets || []),
          plugins: [require.resolve('babel-plugin-transform-runtime')].concat(config.extraBabelPlugins || []),
          cacheDirectory: './.webpack_cache/'
        },
        postcss: function postcss() {
          return [(0, _autoprefixer2.default)(config.autoprefixer || {
            browsers: ['>1%', 'last 4 versions', 'not ie <= 8']
          })].concat(config.extraPostCSSPlugins ? config.extraPostCSSPlugins : []);
        }
      }
    }), new _npmInstallWebpackPluginSteamer2.default({
      // Use --save or --save-dev
      dev: true,
      // Install missing peerDependencies
      peerDependencies: true,
      // Reduce amount of console logging
      quiet: false
    }), new _webpack2.default.DefinePlugin({
      'process.env': {
        'NODE_ENV': (0, _stringify2.default)(NODE_ENV)
      }
    }), new _webpackMd5Hash2.default(),
    // extract css into its own file
    new _extractTextWebpackPlugin2.default({
      filename: '[name].css',
      allChunks: false,
      disable: false
    }),
    // Moment.js is an extremely popular library that bundles large locale files
    // by default due to how Webpack interprets its code. This is a practical
    // solution that requires the user to opt into importing specific locales.
    // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    // You can remove this if you don't use Moment.js:
    new _webpack2.default.IgnorePlugin(/^\.\/locale$/, /moment$/)].concat(
    // Generate a service worker script that will precache, and keep up to date,
    // the HTML & assets that are part of the Webpack build.
    !config.sw ? [] : new _swPrecacheWebpackPlugin2.default({
      // By default, a cache-busting query parameter is appended to requests
      // used to populate the caches, to ensure the responses are fresh.
      // If a URL is already hashed by Webpack, then there is no concern
      // about it being stale, and the cache-busting can be skipped.
      dontCacheBustUrlsMatching: /\.\w{8}\./,
      filename: 'service-worker.js',
      logger: function logger(message) {
        if (message.indexOf('Total precache size is') === 0) {
          // This message occurs for every build and is a bit too noisy.
          return;
        }
        console.log(message);
      },

      minify: true,
      // For unknown URLs, fallback to the index page
      navigateFallback: paths.appPublic + '/index.html',
      // Ignores URLs starting from /__ (useful for Firebase):
      // https://github.com/facebookincubator/create-react-app/issues/2237#issuecomment-302693219
      navigateFallbackWhitelist: [/^(?!\/__).*/],
      // Don't precache sourcemaps (they're large) and build asset manifest:
      staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
      // Work around Windows path issue in SWPrecacheWebpackPlugin:
      // https://github.com/facebookincubator/create-react-app/issues/2235
      stripPrefix: paths.appBuild.replace(/\\/g, '/') + '/'
    })).concat(debug ? [] : new _webpackUglifyParallel2.default({
      workers: _os2.default.cpus().length,
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
    })).concat(!config.analyze ? [] : new _webpackBundleAnalyzer.BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false
    })).concat(!_fs2.default.existsSync(paths.appPublic) ? [] : new _copyWebpackPlugin2.default([{
      from: paths.appPublic,
      to: paths.appBuild
    }])).concat(!config.multipage ? [] : new _webpack2.default.optimize.CommonsChunkPlugin({ name: 'common', filename: 'common.js' })).concat(!config.define ? [] : new _webpack2.default.DefinePlugin((0, _normalizeDefine2.default)(config.define))),
    externals: config.externals
  });
  // console.log(webpackConfig)
  // console.log(JSON.stringify(webpackConfig, null, 2))
  return webpackConfig;
};

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _autoprefixer = require('autoprefixer');

var _autoprefixer2 = _interopRequireDefault(_autoprefixer);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _webpackMerge = require('webpack-merge');

var _webpackMerge2 = _interopRequireDefault(_webpackMerge);

var _extractTextWebpackPlugin = require('extract-text-webpack-plugin');

var _extractTextWebpackPlugin2 = _interopRequireDefault(_extractTextWebpackPlugin);

var _webpackUglifyParallel = require('webpack-uglify-parallel');

var _webpackUglifyParallel2 = _interopRequireDefault(_webpackUglifyParallel);

var _copyWebpackPlugin = require('copy-webpack-plugin');

var _copyWebpackPlugin2 = _interopRequireDefault(_copyWebpackPlugin);

var _webpackBundleAnalyzer = require('webpack-bundle-analyzer');

var _npmInstallWebpackPluginSteamer = require('npm-install-webpack-plugin-steamer');

var _npmInstallWebpackPluginSteamer2 = _interopRequireDefault(_npmInstallWebpackPluginSteamer);

var _webpackMd5Hash = require('webpack-md5-hash');

var _webpackMd5Hash2 = _interopRequireDefault(_webpackMd5Hash);

var _swPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');

var _swPrecacheWebpackPlugin2 = _interopRequireDefault(_swPrecacheWebpackPlugin);

var _getEntry = require('./../utils/getEntry');

var _getEntry2 = _interopRequireDefault(_getEntry);

var _webpackConfig = require('./webpack.config.base');

var _webpackConfig2 = _interopRequireDefault(_webpackConfig);

var _getCSSLoaders = require('./../utils/getCSSLoaders');

var _getCSSLoaders2 = _interopRequireDefault(_getCSSLoaders);

var _normalizeDefine = require('./../utils/normalizeDefine');

var _normalizeDefine2 = _interopRequireDefault(_normalizeDefine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }