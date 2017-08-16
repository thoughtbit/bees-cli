'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (config, cwd) {
  const publicPath = '/';
  const {
    library = null,
    libraryTarget = 'var',
    devtool = _webpackConfig.defaultDevtool
  } = config;

  const paths = (0, _paths2.default)(cwd);

  const styleLoaders = _getCSSLoaders2.default.styleLoaders(config, {
    sourceMap: config.cssSourceMap
  });

  const vueStyleLoaderMap = _getCSSLoaders2.default.cssLoaders(config, {
    sourceMap: config.cssSourceMap
  });

  const output = {
    path: paths.appBuild,
    filename: '[name].js',
    chunkFilename: '[name].async.js',
    publicPath,
    libraryTarget
  };

  if (library) output.library = library;

  const dllPlugins = config.dllPlugin ? [new _webpack2.default.DllReferencePlugin({
    context: paths.appSrc,
    manifest: require((0, _path.join)(paths.dllNodeModule, `${config.dllPlugin.name}.json`)) // eslint-disable-line
  }), new _copyWebpackPlugin2.default([{
    from: (0, _path.join)(paths.dllNodeModule, `${config.dllPlugin.name}.dll.js`),
    to: (0, _path.join)(paths.appBuild, `${config.dllPlugin.name}.dll.js`)
  }])] : [];

  const commonConfig = (0, _webpackConfig2.default)(config, paths);

  // "url" loader works like "file" loader except that it embeds assets
  // smaller than specified limit in bytes as data URLs to avoid requests.
  // A missing `test` is equivalent to a match.
  const imageLoader = {
    test: [/\.jpe?g$/, /\.png$/, /\.gif$/, /\.svg$/],
    loaders: [{
      loader: 'url-loader',
      query: {
        limit: 10000,
        name: 'static/[name].[hash:8].[ext]'
      }
    }]
  };

  commonConfig.module.rules.push(imageLoader);

  if (config.use === 'vue') {
    commonConfig.resolve.alias['vue$'] = 'vue/dist/vue.esm.js';

    // vue-loader的样式loader配置
    const vueLoader = {
      test: /\.vue$/,
      loader: 'vue-loader',
      include: paths.appSrc,
      options: {
        loaders: {}
      }
    };

    /*
      // 预编译器，默认支持css 和 less. sass, scss 和 stylus 由npm-install-webpack-plugin自动安装
      style: ["css", "less"]
    */
    config.style.forEach(style => {
      vueLoader.options.loaders[style] = vueStyleLoaderMap[style];
      let rule = styleLoaders[style] || '';
      rule && commonConfig.module.rules.push(rule);
    });
    commonConfig.module.rules.push(vueLoader);
  } else {
    config.style.forEach(style => {
      let rule = styleLoaders[style] || '';
      rule && commonConfig.module.rules.push(rule);
    });
  }

  const webpackConfig = (0, _webpackMerge2.default)(commonConfig, {
    devtool,
    entry: (0, _getEntry2.default)(config, paths),
    output,
    plugins: [
    // Add module names to factory functions so they appear in browser profiler.
    new _webpack2.default.NamedModulesPlugin(),
    // extract css into its own file
    new _extractTextWebpackPlugin2.default({
      filename: '[name].css',
      allChunks: false,
      disable: true
    }),
    // This is necessary to emit hot updates (currently CSS only):
    new _webpack2.default.HotModuleReplacementPlugin(),
    // Watcher doesn't work well if you mistype casing in a path so we use
    // a plugin that prints an error when you attempt to do this.
    new _caseSensitivePathsWebpackPlugin2.default(),
    // If you require a missing module and then `npm install` it, you still have
    // to restart the development server for Webpack to discover it. This plugin
    // makes the discovery automatic so you don't have to restart.
    new _WatchMissingNodeModulesPlugin2.default(paths.appNodeModules), ...dllPlugins, ...(0, _webpackConfig.getCommonPlugins)({
      config,
      paths,
      appBuild: paths.appBuild,
      NODE_ENV: process.env.NODE_ENV
    })],
    // 开发环境中没必要开启性能警告提示，反而影响速度.
    performance: {
      hints: false
    },
    externals: config.externals
  });
  // console.log(webpackConfig)
  // console.log(JSON.stringify(webpackConfig, null, 2))
  return webpackConfig;
};

var _path = require('path');

var _caseSensitivePathsWebpackPlugin = require('case-sensitive-paths-webpack-plugin');

var _caseSensitivePathsWebpackPlugin2 = _interopRequireDefault(_caseSensitivePathsWebpackPlugin);

var _WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');

var _WatchMissingNodeModulesPlugin2 = _interopRequireDefault(_WatchMissingNodeModulesPlugin);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _webpackMerge = require('webpack-merge');

var _webpackMerge2 = _interopRequireDefault(_webpackMerge);

var _copyWebpackPlugin = require('copy-webpack-plugin');

var _copyWebpackPlugin2 = _interopRequireDefault(_copyWebpackPlugin);

var _extractTextWebpackPlugin = require('extract-text-webpack-plugin');

var _extractTextWebpackPlugin2 = _interopRequireDefault(_extractTextWebpackPlugin);

var _webpackConfig = require('./webpack.config.base');

var _webpackConfig2 = _interopRequireDefault(_webpackConfig);

var _paths = require('./paths');

var _paths2 = _interopRequireDefault(_paths);

var _getEntry = require('./../utils/getEntry');

var _getEntry2 = _interopRequireDefault(_getEntry);

var _getCSSLoaders = require('./../utils/getCSSLoaders');

var _getCSSLoaders2 = _interopRequireDefault(_getCSSLoaders);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }