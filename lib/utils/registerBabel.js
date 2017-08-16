'use strict';

var _path = require('path');

var _winPath = require('./winPath');

var _winPath2 = _interopRequireDefault(_winPath);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const cwd = process.cwd();
const files = ['webpack.config.js', '.beesrc.js', '.beesrc.mock.js', (0, _winPath2.default)((0, _path.join)(cwd, 'mock')), (0, _winPath2.default)((0, _path.join)(cwd, 'src'))];

if (process.env.NODE_ENV !== 'test') {
  require('babel-register')({
    only: new RegExp(`(${files.join('|')})`),
    presets: [
    // Latest stable ECMAScript features
    [require.resolve('babel-preset-env'), {
      node: 'current'
    }], require.resolve('babel-preset-stage-0')],
    plugins: [require.resolve('babel-plugin-transform-runtime')],
    babelrc: false
  });
}