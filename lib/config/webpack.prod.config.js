'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (args, appBuild, config, paths) {
  var debug = args.debug;

  var NODE_ENV = debug ? 'development' : process.env.NODE_ENV;

  var publicPath = config.publicPath || '/';
  var styleLoaders = _getCSSLoaders2.default.styleLoaders({
    sourceMap: config.cssSourceMap,
    extract: true
  });

  var commonConfig = (0, _webpackBase2.default)(config, paths);

  return (0, _webpackMerge2.default)(commonConfig, {
    bail: true,
    entry: (0, _getEntry2.default)(config, paths.appDirectory),
    output: {
      path: appBuild,
      filename: '[name].js',
      publicPath: publicPath
    },
    module: {
      loaders: styleLoaders
    },
    postcss: function postcss() {
      return [(0, _autoprefixer2.default)(config.autoprefixer || {
        browsers: ['>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9' // React doesn't support IE8 anyway
        ]
      })].concat(config.extraPostCSSPlugins ? config.extraPostCSSPlugins : []);
    },

    plugins: [new _webpack2.default.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(NODE_ENV)
      }
    }),
    // 按引用频度来排序 ID，以便达到减少文件大小的效果
    new _webpack2.default.optimize.OccurrenceOrderPlugin(),
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
      sourceMap: false
    })).concat(!config.analyze ? [] : new _webpackBundleAnalyzer.BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false
    })).concat(!_fs2.default.existsSync(paths.appPublic) ? [] : new _copyWebpackPlugin2.default([{
      from: paths.appPublic,
      to: paths.appBuild
    }])).concat(!config.multipage ? [] : new _webpack2.default.optimize.CommonsChunkPlugin({ name: 'common' })).concat(!config.define ? [] : new _webpack2.default.DefinePlugin((0, _normalizeDefine2.default)(config.define))),
    externals: config.externals
  });
};

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

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

var _getEntry = require('../utils/getEntry');

var _getEntry2 = _interopRequireDefault(_getEntry);

var _webpackBase = require('./webpack.base.config');

var _webpackBase2 = _interopRequireDefault(_webpackBase);

var _getCSSLoaders = require('./../utils/getCSSLoaders');

var _getCSSLoaders2 = _interopRequireDefault(_getCSSLoaders);

var _normalizeDefine = require('./../utils/normalizeDefine');

var _normalizeDefine2 = _interopRequireDefault(_normalizeDefine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }