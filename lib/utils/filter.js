'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.default = function (files, filters, data, done) {
  if (!filters) {
    return done();
  }
  var fileNames = (0, _keys2.default)(files);
  (0, _keys2.default)(filters).forEach(function (glob) {
    fileNames.forEach(function (file) {
      if ((0, _minimatch2.default)(file, glob, { dot: true })) {
        var condition = filters[glob];
        if (!(0, _eval2.default)(condition, data)) {
          delete files[file];
        }
      }
    });
  });
  done();
};

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

var _eval = require('./eval');

var _eval2 = _interopRequireDefault(_eval);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }