'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (config, cwd) {
  var _config$publicPath = config.publicPath,
      publicPath = _config$publicPath === undefined ? '/' : _config$publicPath,
      _config$library = config.library,
      library = _config$library === undefined ? null : _config$library,
      _config$libraryTarget = config.libraryTarget,
      libraryTarget = _config$libraryTarget === undefined ? 'var' : _config$libraryTarget;

  var paths = (0, _paths2.default)(cwd);
  var styleLoaders = _getCSSLoaders2.default.styleLoaders(config, {
    sourceMap: config.cssSourceMap
  });
  config.vueLoaders = _getCSSLoaders2.default.cssLoaders(config, {
    sourceMap: config.cssSourceMap,
    extract: false
  });
  var output = {
    path: paths.appBuild,
    filename: '[name].js',
    pathinfo: true,
    publicPath: publicPath,
    libraryTarget: libraryTarget,
    chunkFilename: '[id].async.js'
  };

  if (library) output.library = library;

  var dllPlugins = config.dllPlugin ? [new _webpack2.default.DllReferencePlugin({
    context: paths.appSrc,
    manifest: require((0, _path.join)(paths.dllNodeModule, config.dllPlugin.name + '.json')) // eslint-disable-line
  }), new _copyWebpackPlugin2.default([{
    from: (0, _path.join)(paths.dllNodeModule, config.dllPlugin.name + '.dll.js'),
    to: (0, _path.join)(paths.appBuild, config.dllPlugin.name + '.dll.js')
  }])] : [];

  var commonConfig = (0, _webpackConfig2.default)(config, paths);
  var webpackConfig = (0, _webpackMerge2.default)(commonConfig, {
    devtool: 'cheap-module-source-map',
    entry: (0, _getEntry2.default)(config, paths.appDirectory),
    output: output,
    module: {
      rules: styleLoaders
    },
    plugins: [new _webpack2.default.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    }), new _webpack2.default.LoaderOptionsPlugin({
      options: {
        babel: {
          babelrc: false,
          presets: [[require.resolve('babel-preset-env'), { modules: false }], require.resolve('babel-preset-stage-2')].concat(config.extraBabelPresets || []),
          plugins: [require.resolve('babel-plugin-transform-runtime')].concat(config.extraBabelPlugins || []),
          cacheDirectory: true
        },
        postcss: function postcss() {
          return [(0, _autoprefixer2.default)(config.autoprefixer || {
            browsers: ['>1%', 'last 4 versions', 'not ie <= 8']
          })].concat(config.extraPostCSSPlugins ? config.extraPostCSSPlugins : []);
        }
      }
    }), new _webpack2.default.HotModuleReplacementPlugin(), new _caseSensitivePathsWebpackPlugin2.default(), new _WatchMissingNodeModulesPlugin2.default(paths.appNodeModules),
    // 取代 system-bell-webpack-plugin
    new _friendlyErrorsWebpackPlugin2.default()].concat(dllPlugins).concat(!config.analyze ? [] : new _webpackBundleAnalyzer.BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: paths.resolveOwn('../reports/' + process.env.NODE_ENV + '.html')
    })).concat(!_fs2.default.existsSync(paths.appPublic) ? [] : new _copyWebpackPlugin2.default([{
      from: paths.appPublic,
      to: paths.appBuild
    }])).concat(!config.multipage ? [] : new _webpack2.default.optimize.CommonsChunkPlugin({ name: 'common', filename: 'common.js' })).concat(!config.define ? [] : new _webpack2.default.DefinePlugin((0, _normalizeDefine2.default)(config.define))),
    externals: config.externals
  });
  return webpackConfig;
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _autoprefixer = require('autoprefixer');

var _autoprefixer2 = _interopRequireDefault(_autoprefixer);

var _caseSensitivePathsWebpackPlugin = require('case-sensitive-paths-webpack-plugin');

var _caseSensitivePathsWebpackPlugin2 = _interopRequireDefault(_caseSensitivePathsWebpackPlugin);

var _WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');

var _WatchMissingNodeModulesPlugin2 = _interopRequireDefault(_WatchMissingNodeModulesPlugin);

var _friendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

var _friendlyErrorsWebpackPlugin2 = _interopRequireDefault(_friendlyErrorsWebpackPlugin);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _webpackMerge = require('webpack-merge');

var _webpackMerge2 = _interopRequireDefault(_webpackMerge);

var _copyWebpackPlugin = require('copy-webpack-plugin');

var _copyWebpackPlugin2 = _interopRequireDefault(_copyWebpackPlugin);

var _webpackBundleAnalyzer = require('webpack-bundle-analyzer');

var _webpackConfig = require('./webpack.config.base');

var _webpackConfig2 = _interopRequireDefault(_webpackConfig);

var _paths = require('./paths');

var _paths2 = _interopRequireDefault(_paths);

var _getEntry = require('./../utils/getEntry');

var _getEntry2 = _interopRequireDefault(_getEntry);

var _getCSSLoaders = require('./../utils/getCSSLoaders');

var _getCSSLoaders2 = _interopRequireDefault(_getCSSLoaders);

var _normalizeDefine = require('./../utils/normalizeDefine');

var _normalizeDefine2 = _interopRequireDefault(_normalizeDefine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }