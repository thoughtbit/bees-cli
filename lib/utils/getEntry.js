'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports.getFiles = getFiles;
exports.getEntries = getEntries;

exports.default = function (config, paths, isBuild) {
  const appDirectory = paths.appDirectory;
  const entry = config.entry;
  // support write object for entry
  if ((0, _isPlainObject2.default)(entry)) {
    if (isBuild) {
      return entry;
    }

    return (0, _keys2.default)(entry).reduce((memo, key) => !Array.isArray(entry[key]) ? (0, _extends3.default)({}, memo, {
      [key]: [require.resolve('react-dev-utils/webpackHotDevClient'), entry[key]]
    }) : (0, _extends3.default)({}, memo, {
      [key]: entry[key]
    }), {});
  }
  const files = entry ? getFiles(paths.resolveApp(entry), appDirectory) : [paths.appIndexJs];
  return getEntries(files, isBuild);
};

var _path = require('path');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getEntry(filePath, isBuild) {
  const key = (0, _path.basename)(filePath).replace(/\.(jsx?|tsx?)$/, '');
  const value = isBuild ? [require.resolve('./polyfills'), filePath] : [require.resolve('react-dev-utils/webpackHotDevClient'), require.resolve('./polyfills'), filePath];
  return {
    [key]: value
  };
}

function getFiles(entry, cwd) {
  if (Array.isArray(entry)) {
    return entry.reduce((memo, entryItem) => {
      return memo.concat(getFiles(entryItem, cwd));
    }, []);
  } else {
    (0, _assert2.default)(typeof entry === 'string', `getEntry/getFiles: entry type should be string, but got ${typeof entry}`);
    const files = _glob2.default.sync(entry, {
      cwd
    });
    // return files.map((file) => {
    //   return (file.charAt(0) === '.') ? file : `.${sep}${file}`
    // })
    return files;
  }
}

function getEntries(files, isBuild) {
  return files.reduce((memo, file) => {
    return (0, _assign2.default)(memo, getEntry(file, isBuild));
  }, {});
}