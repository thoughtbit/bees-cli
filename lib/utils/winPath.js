'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (path) {
  return path.replace(/\\/g, '/');
};