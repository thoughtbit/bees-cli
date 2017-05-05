'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

exports.getFiles = getFiles;
exports.getEntries = getEntries;

exports.default = function (config, paths, isBuild) {
  var appDirectory = paths.appDirectory;
  var entry = config.entry;
  var files = entry ? getFiles(entry, appDirectory) : [paths.appIndexJs];
  return getEntries(files, isBuild);
};

var _path = require('path');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getEntry(filePath, isBuild) {
  var key = (0, _path.basename)(filePath, '.js');
  var value = isBuild ? [require.resolve('./polyfills'), filePath] : [require.resolve('react-dev-utils/webpackHotDevClient'), require.resolve('./polyfills'), filePath];
  return (0, _defineProperty3.default)({}, key, value);
}

function getFiles(entry, cwd) {
  if (Array.isArray(entry)) {
    return entry.reduce(function (memo, entryItem) {
      return memo.concat(getFiles(entryItem, cwd));
    }, []);
  } else {
    (0, _assert2.default)(typeof entry === 'string', 'getEntry/getFiles: entry type should be string, but got ' + (typeof entry === 'undefined' ? 'undefined' : (0, _typeof3.default)(entry)));
    var files = _glob2.default.sync(entry, {
      cwd: cwd
    });
    return files.map(function (file) {
      return file.charAt(0) === '.' ? file : '.' + _path.sep + file;
    });
  }
}

function getEntries(files, isBuild) {
  return files.reduce(function (memo, file) {
    return (0, _assign2.default)(memo, getEntry(file, isBuild));
  }, {});
}