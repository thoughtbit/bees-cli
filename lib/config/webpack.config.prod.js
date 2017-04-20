'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (args, appBuild, config, paths) {
  var debug = args.debug;

  var NODE_ENV = debug ? 'development' : process.env.NODE_ENV;

  var publicPath = config.publicPath || '/';
  var styleLoaders = _getCSSLoaders2.default.styleLoaders(config, {
    sourceMap: config.cssSourceMap,
    extract: true
  });

  var commonConfig = (0, _webpackConfig2.default)(config, paths);

  var webpackConfig = (0, _webpackMerge2.default)(commonConfig, {
    bail: true,
    entry: (0, _getEntry2.default)(config, paths.appDirectory, /* isBuild */true),
    output: {
      path: appBuild,
      filename: '[name].js',
      publicPath: publicPath,
      chunkFilename: '[id].async.js'
    },
    module: {
      rules: styleLoaders
    },
    plugins: [new _webpack2.default.DefinePlugin({
      'process.env': {
        '__VERSION__': JSON.stringify(paths.appPackageJson.version),
        'NODE_ENV': JSON.stringify(NODE_ENV)
      }
    }), new _webpack2.default.LoaderOptionsPlugin({
      options: {
        babel: {
          babelrc: false,
          presets: [[require.resolve('babel-preset-es2015'), { modules: false }], require.resolve('babel-preset-stage-0')].concat(config.extraBabelPresets || []),
          plugins: [require.resolve('babel-plugin-add-module-exports')].concat(config.extraBabelPlugins || []),
          cacheDirectory: true
        },
        postcss: function postcss() {
          return [(0, _autoprefixer2.default)(config.autoprefixer || {
            browsers: ['>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9' // React doesn't support IE8 anyway
            ]
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
      openAnalyzer: false,
      reportFilename: paths.resolveOwn('../reports/' + process.env.NODE_ENV + '.html')
    })).concat(!_fs2.default.existsSync(paths.appPublic) ? [] : new _copyWebpackPlugin2.default([{
      from: paths.appPublic,
      to: paths.appBuild
    }])).concat(!config.multipage ? [] : new _webpack2.default.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function minChunks(module, count) {
        // any required modules inside node_modules are extracted to vendor
        return module.resource && /\.js$/.test(module.resource) && module.resource.indexOf((0, _path.join)(__dirname, '../node_modules')) === 0;
      }
    })).concat(!config.define ? [] : new _webpack2.default.DefinePlugin((0, _normalizeDefine2.default)(config.define))),
    externals: config.externals
  });

  webpackConfig.module.loaders.push({
    test: /\.(js|jsx|vue)$/,
    exclude: /\/node_modules\//,
    loader: 'rollup-loader',
    options: {
      external: false,
      plugins: [(0, _rollupPluginNodeResolve2.default)(), (0, _rollupPluginCommonjs2.default)(), (0, _rollupPluginVue2.default)({
        compileTemplate: true
      }), (0, _rollupPluginJsx2.default)({ factory: 'h' }), (0, _rollupPluginReplace2.default)(Object.assign({
        __VERSION__: paths.appPackageJson.version
      }, {
        'process.env': {
          'NODE_ENV': JSON.stringify(NODE_ENV)
        }
      })),
      // rollupBuble(),
      (0, _rollupPluginBabel2.default)((0, _babelrcRollup2.default)())]
    }
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

var _rollupPluginBabel = require('rollup-plugin-babel');

var _rollupPluginBabel2 = _interopRequireDefault(_rollupPluginBabel);

var _babelrcRollup = require('babelrc-rollup');

var _babelrcRollup2 = _interopRequireDefault(_babelrcRollup);

var _rollupPluginNodeResolve = require('rollup-plugin-node-resolve');

var _rollupPluginNodeResolve2 = _interopRequireDefault(_rollupPluginNodeResolve);

var _rollupPluginVue = require('rollup-plugin-vue');

var _rollupPluginVue2 = _interopRequireDefault(_rollupPluginVue);

var _rollupPluginJsx = require('rollup-plugin-jsx');

var _rollupPluginJsx2 = _interopRequireDefault(_rollupPluginJsx);

var _rollupPluginReplace = require('rollup-plugin-replace');

var _rollupPluginReplace2 = _interopRequireDefault(_rollupPluginReplace);

var _rollupPluginCommonjs = require('rollup-plugin-commonjs');

var _rollupPluginCommonjs2 = _interopRequireDefault(_rollupPluginCommonjs);

var _getEntry = require('./../utils/getEntry');

var _getEntry2 = _interopRequireDefault(_getEntry);

var _webpackConfig = require('./webpack.config.base');

var _webpackConfig2 = _interopRequireDefault(_webpackConfig);

var _getCSSLoaders = require('./../utils/getCSSLoaders');

var _getCSSLoaders2 = _interopRequireDefault(_getCSSLoaders);

var _normalizeDefine = require('./../utils/normalizeDefine');

var _normalizeDefine2 = _interopRequireDefault(_normalizeDefine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }