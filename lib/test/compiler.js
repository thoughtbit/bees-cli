'use strict';

require('babel-register')({
  presets: [require.resolve('babel-preset-es2015'), require.resolve('babel-preset-stage-2')],
  plugins: [require.resolve('babel-plugin-transform-runtime')]
});
const noop = () => null;
['.css', '.less', '.html', '.htm'].forEach(ext => {
  require.extensions[ext] = noop;
});