'use strict';

require('babel-register')({
  presets: [require.resolve('babel-preset-es2015'), require.resolve('babel-preset-stage-2')],
  plugins: [require.resolve('babel-plugin-transform-runtime')]
});
var noop = function noop() {
  return null;
};
['.css', '.less', '.html', '.htm'].forEach(function (ext) {
  require.extensions[ext] = noop;
});