'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (args, appBuild, config, paths) {
  const env = process.env.NODE_ENV;
  const isWindows = _os2.default.type() === 'Windows_NT';
  const { debug } = args;
  const NODE_ENV = debug ? 'development' : env;

  const {
    publicPath = '/',
    library = null,
    libraryTarget = 'var',
    devtool = debug ? _webpackConfig.defaultDevtool : false
  } = config;

  const styleLoaders = _getCSSLoaders2.default.styleLoaders(config, {
    sourceMap: config.cssSourceMap
  });

  const vueStyleLoaderMap = _getCSSLoaders2.default.cssLoaders(config, {
    sourceMap: config.cssSourceMap
  });

  // Support hash
  const name = config.hash ? '[name].[chunkhash]' : '[name]';
  const output = {
    path: appBuild,
    filename: `${name}.js`,
    chunkFilename: `${name}.async.js`,
    publicPath,
    libraryTarget
  };

  if (library) output.library = library;

  const commonConfig = (0, _webpackConfig2.default)(config, paths);

  // "url" loader works like "file" loader except that it embeds assets
  // smaller than specified limit in bytes as data URLs to avoid requests.
  // A missing `test` is equivalent to a match.
  const imageLoader = {
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
    const vueLoader = {
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
    // Don't attempt to continue if there are any errors.
    bail: true,
    entry: (0, _getEntry2.default)(config, paths, /* isBuild */true),
    output,
    plugins: [new _webpackMd5Hash2.default(),
    // extract css into its own file
    new _extractTextWebpackPlugin2.default({
      filename: '[name].css',
      allChunks: false,
      disable: false
    }), ...(0, _webpackConfig.getCommonPlugins)({
      config,
      paths,
      appBuild: paths.appBuild,
      NODE_ENV: NODE_ENV
    }), ...(debug ? [] : [new _webpackUglifyParallel2.default({
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
    })]), ...(config.analyze ? [new _webpackBundleAnalyzer.BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false
    })] : []), ...(0, _webpackConfig.getSWPlugins)({ config, paths })],
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

var _getEntry = require('./../utils/getEntry');

var _getEntry2 = _interopRequireDefault(_getEntry);

var _webpackConfig = require('./webpack.config.base');

var _webpackConfig2 = _interopRequireDefault(_webpackConfig);

var _getCSSLoaders = require('./../utils/getCSSLoaders');

var _getCSSLoaders2 = _interopRequireDefault(_getCSSLoaders);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }