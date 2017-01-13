'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extractTextWebpackPlugin = require('extract-text-webpack-plugin');

var _extractTextWebpackPlugin2 = _interopRequireDefault(_extractTextWebpackPlugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function cssLoaders(options) {
  options = options || {};
  // generate loader string to be used with extract text plugin
  function generateLoaders(loaders) {
    // if (options.postcss) {
    //   loaders.splice(1, 0, 'postcss')
    // }
    var sourceLoader = loaders.map(function (loader) {
      var extraParamChar = void 0;
      if (/\?/.test(loader)) {
        loader = loader.replace(/\?/, '-loader?');
        extraParamChar = '&';
      } else {
        loader = loader + '-loader';
        extraParamChar = '?';
      }
      return loader + (options.sourceMap ? extraParamChar + 'sourceMap' : '');
    }).join('!');

    if (options.extract) {
      return _extractTextWebpackPlugin2.default.extract('style-loader', sourceLoader);
    } else {
      return ['style-loader', sourceLoader].join('!');
    }
  }

  return {
    css: generateLoaders(['css', 'postcss']),
    less: generateLoaders(['css', 'less', 'postcss', 'resolve-url']),
    sass: generateLoaders(['css', 'sass?indentedSyntax', 'postcss', 'resolve-url']),
    scss: generateLoaders(['css', 'sass', 'postcss', 'resolve-url']),
    stylus: generateLoaders(['css', 'stylus', 'postcss', 'resolve-url']),
    styl: generateLoaders(['css', 'stylus', 'postcss', 'resolve-url'])
  };
}

// Generate loaders for standalone style files (outside of .vue)
function styleLoaders(options) {
  var output = [];
  var loaders = cssLoaders(options);
  for (var extension in loaders) {
    var loader = loaders[extension];
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      loader: loader
    });
  }
  return output;
}

exports.default = {
  cssLoaders: cssLoaders,
  styleLoaders: styleLoaders
};