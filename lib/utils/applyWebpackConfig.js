'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.warnIfExists = warnIfExists;
exports.default = applyWebpackConfig;

var _fs = require('fs');

var _path = require('path');

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('./registerBabel');

function warnIfExists() {
  const filePath = (0, _path.resolve)('webpack.config.js');
  if ((0, _fs.existsSync)(filePath)) {
    console.log(_chalk2.default.yellow(`警告：⚠️ 不推荐通过 ${_chalk2.default.red('webpack.config.js')} 以编码的方式进行配置。如果你坚持这样做,请小心 ${_chalk2.default.red('bees')} 升级后的兼容性问题。`));
    console.log();
  }
}

function applyWebpackConfig(config, env) {
  const filePath = (0, _path.resolve)('webpack.config.js');
  if ((0, _fs.existsSync)(filePath)) {
    return require(filePath)(config, env); // eslint-disable-line
  } else {
    return config;
  }
}