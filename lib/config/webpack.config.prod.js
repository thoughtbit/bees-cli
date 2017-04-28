'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.default = function (args, appBuild, config, paths) {
  var debug = args.debug;

  var NODE_ENV = debug ? 'development' : process.env.NODE_ENV;

  var _config$publicPath = config.publicPath,
      publicPath = _config$publicPath === undefined ? '/' : _config$publicPath,
      _config$library = config.library,
      library = _config$library === undefined ? null : _config$library,
      _config$libraryTarget = config.libraryTarget,
      libraryTarget = _config$libraryTarget === undefined ? 'var' : _config$libraryTarget;


  var styleLoaders = _getCSSLoaders2.default.styleLoaders(config, {
    sourceMap: config.cssSourceMap,
    extract: true
  });

  var output = {
    path: appBuild,
    filename: '[name].js',
    publicPath: publicPath,
    libraryTarget: libraryTarget,
    chunkFilename: '[id].async.js'
  };

  if (library) output.library = library;

  var commonConfig = (0, _webpackConfig2.default)(config, paths);

  var webpackConfig = (0, _webpackMerge2.default)(commonConfig, {
    bail: true,
    entry: (0, _getEntry2.default)(config, paths.appDirectory, /* isBuild */true),
    output: output,
    module: {
      rules: styleLoaders
    },
    plugins: [new _webpack2.default.DefinePlugin({
      'process.env': {
        'NODE_ENV': (0, _stringify2.default)(NODE_ENV)
      }
    }), new _webpack2.default.LoaderOptionsPlugin({
      options: {
        babel: {
          presets: [require.resolve('babel-preset-es2015'), require.resolve('babel-preset-stage-2')].concat(config.extraBabelPresets || []),
          plugins: [require.resolve('babel-plugin-transform-runtime')].concat(config.extraBabelPlugins || []),
          cacheDirectory: true
        },
        postcss: function postcss() {
          return [(0, _autoprefixer2.default)(config.autoprefixer || {
            browsers: ['>1%', 'last 4 versions', 'not ie <= 8']
          })].concat(config.extraPostCSSPlugins ? config.extraPostCSSPlugins : []);
        }
      }
    }),
    // 排除相似的或相同的，避免在最终生成的文件中出现重复的模块。
    new _webpack2.default.optimize.DedupePlugin(),
    // extract css into its own file
    new _extractTextWebpackPlugin2.default('[name].css')].concat(debug ? [] : new _webpackUglifyParallel2.default({
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

var _getEntry = require('./../utils/getEntry');

var _getEntry2 = _interopRequireDefault(_getEntry);

var _webpackConfig = require('./webpack.config.base');

var _webpackConfig2 = _interopRequireDefault(_webpackConfig);

var _getCSSLoaders = require('./../utils/getCSSLoaders');

var _getCSSLoaders2 = _interopRequireDefault(_getCSSLoaders);

var _normalizeDefine = require('./../utils/normalizeDefine');

var _normalizeDefine2 = _interopRequireDefault(_normalizeDefine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }