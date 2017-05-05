'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _extractTextWebpackPlugin = require('extract-text-webpack-plugin');

var _extractTextWebpackPlugin2 = _interopRequireDefault(_extractTextWebpackPlugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function cssLoaders(config, options) {
  var cssLoader = void 0;
  options = options || {};
  if (!config.disableCSSModules) {
    cssLoader = {
      loader: 'css-loader',
      options: {
        importLoaders: 1,
        minimize: process.env.NODE_ENV === 'production',
        sourceMap: options.sourceMap
      }
    };
  } else {
    cssLoader = {
      loader: 'css-loader',
      options: {
        importLoaders: 1,
        modules: true,
        localIdentName: '[local]--[hash:base64:5]',
        minimize: process.env.NODE_ENV === 'production',
        sourceMap: options.sourceMap
      }
    };
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders(loader, loaderOptions) {
    var loaders = [cssLoader];
    var use = config.use === 'vue' ? 'vue-' : '';
    if (loader) {
      loaders.push({
        loader: 'postcss-loader',
        options: { sourceMap: options.sourceMap }
      }, {
        loader: loader + '-loader',
        options: (0, _assign2.default)({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      });
    } else {
      loaders.push({
        loader: 'postcss-loader',
        options: { sourceMap: options.sourceMap }
      });
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return _extractTextWebpackPlugin2.default.extract({
        use: loaders,
        fallback: use + 'style-loader'
      });
    } else {
      return [use + 'style-loader'].concat(loaders);
    }
  }

  // http://vuejs.github.io/vue-loader/en/configurations/extract-css.html
  if (config.use === 'vue') {
    return {
      css: generateLoaders(),
      postcss: generateLoaders(),
      less: generateLoaders('less'),
      sass: generateLoaders('sass', { indentedSyntax: true }),
      scss: generateLoaders('sass'),
      stylus: generateLoaders('stylus'),
      styl: generateLoaders('stylus')
    };
  } else {
    return {
      css: generateLoaders(),
      less: generateLoaders('less'),
      sass: generateLoaders('sass', { indentedSyntax: true }),
      scss: generateLoaders('sass'),
      stylus: generateLoaders('stylus'),
      styl: generateLoaders('stylus')
    };
  }
}

// Generate loaders for standalone style files
function styleLoaders(config, options) {
  var output = {};
  var loaders = cssLoaders(config, options);
  for (var extension in loaders) {
    var loader = loaders[extension];
    var rule = {
      test: new RegExp('\\.' + extension + '$'),
      loader: loader
    };
    output[extension] = rule;
  }
  return output;
}

exports.default = {
  cssLoaders: cssLoaders,
  styleLoaders: styleLoaders
};