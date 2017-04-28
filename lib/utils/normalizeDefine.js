"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

exports.default = normalizeDefine;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function normalizeDefine(define) {
  return (0, _keys2.default)(define).reduce(function (memo, key) {
    memo[key] = (0, _stringify2.default)(define[key]);
    return memo;
  }, {});
}