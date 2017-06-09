'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

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
      libraryTarget = _config$libraryTarget === undefined ? 'var' : _config$libraryTarget,
      _config$devtool = config.devtool,
      devtool = _config$devtool === undefined ? debug ? _webpackConfig.defaultDevtool : false : _config$devtool;


  var styleLoaders = _getCSSLoaders2.default.styleLoaders(config, {
    sourceMap: config.cssSourceMap
  });

  var vueStyleLoaderMap = _getCSSLoaders2.default.cssLoaders(config, {
    sourceMap: config.cssSourceMap
  });

  var output = {
    path: appBuild,
    filename: '[name].js',
    chunkFilename: '[name].async.js',
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
    plugins: [new _webpack2.default.NoEmitOnErrorsPlugin(), new _webpackMd5Hash2.default(),
    // extract css into its own file
    new _extractTextWebpackPlugin2.default({
      filename: '[name].css',
      allChunks: false,
      disable: false
    })].concat((0, _toConsumableArray3.default)((0, _webpackConfig.getCommonPlugins)({
      config: config,
      paths: paths,
      appBuild: paths.appBuild,
      NODE_ENV: NODE_ENV
    })), (0, _toConsumableArray3.default)(debug ? [] : [new _webpackUglifyParallel2.default({
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
    })]), (0, _toConsumableArray3.default)(config.analyze ? [new _webpackBundleAnalyzer.BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false
    })] : []), (0, _toConsumableArray3.default)(config.sw ? [new _webpackManifestPlugin2.default({
      fileName: 'asset-manifest.json'
    })] : []), (0, _toConsumableArray3.default)(config.sw ? [new _swPrecacheWebpackPlugin2.default({
      dontCacheBustUrlsMatching: /\.\w{8}\./,
      filename: 'service-worker.js',
      logger: function logger(message) {
        if (message.indexOf('Total precache size is') === 0) {
          return;
        }
        console.log(message);
      },

      minify: true,
      navigateFallback: '/index.html',
      navigateFallbackWhitelist: [/^(?!\/__).*/],
      staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
      stripPrefix: paths.appBuild.replace(/\\/g, '/') + '/'
    })] : [])),
    externals: config.externals
  });
  // console.log(webpackConfig)
  // console.log(JSON.stringify(webpackConfig, null, 2))
  return webpackConfig;
};

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _path = require('path');

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

var _webpackMd5Hash = require('webpack-md5-hash');

var _webpackMd5Hash2 = _interopRequireDefault(_webpackMd5Hash);

var _webpackManifestPlugin = require('webpack-manifest-plugin');

var _webpackManifestPlugin2 = _interopRequireDefault(_webpackManifestPlugin);

var _swPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');

var _swPrecacheWebpackPlugin2 = _interopRequireDefault(_swPrecacheWebpackPlugin);

var _getEntry = require('./../utils/getEntry');

var _getEntry2 = _interopRequireDefault(_getEntry);

var _webpackConfig = require('./webpack.config.base');

var _webpackConfig2 = _interopRequireDefault(_webpackConfig);

var _getCSSLoaders = require('./../utils/getCSSLoaders');

var _getCSSLoaders2 = _interopRequireDefault(_getCSSLoaders);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }