"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (stats, fn) {
  if (stats && Array.isArray(stats)) {
    return stats.map(fn);
  } else {
    return fn(stats);
  }
};