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
  var filePath = (0, _path.resolve)('webpack.config.js');
  if ((0, _fs.existsSync)(filePath)) {
    console.log(_chalk2.default.yellow('\u8B66\u544A\uFF1A\u26A0\uFE0F \u4E0D\u63A8\u8350\u901A\u8FC7 ' + _chalk2.default.red('webpack.config.js') + ' \u4EE5\u7F16\u7801\u7684\u65B9\u5F0F\u8FDB\u884C\u914D\u7F6E\u3002\u5982\u679C\u4F60\u575A\u6301\u8FD9\u6837\u505A,\u8BF7\u5C0F\u5FC3 ' + _chalk2.default.red('bees') + ' \u5347\u7EA7\u540E\u7684\u517C\u5BB9\u6027\u95EE\u9898\u3002'));
    console.log();
  }
}

function applyWebpackConfig(config, env) {
  var filePath = (0, _path.resolve)('webpack.config.js');
  if ((0, _fs.existsSync)(filePath)) {
    return require(filePath)(config, env); // eslint-disable-line
  } else {
    return config;
  }
}