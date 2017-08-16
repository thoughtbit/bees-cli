'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _util = require('util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Prefix.
 */

const prefix = '   bees-cli';
const sep = _chalk2.default.gray('·');

/**
 * Log a `message` to the console.
 *
 * @param {String} message
 */

function log() {
  const msg = _util.format.apply(_util.format, arguments);
  console.log(_chalk2.default.white(prefix), sep, msg);
}

/**
 * Log an error `message` to the console and exit.
 *
 * @param {String} message
 */

function fatal(message) {
  if (message instanceof Error) message = message.message.trim();
  const msg = _util.format.apply(_util.format, arguments);
  console.error(_chalk2.default.red(prefix), sep, msg);
  process.exit(1);
}

/**
 * Log a success `message` to the console and exit.
 *
 * @param {String} message
 */

function success() {
  const msg = _util.format.apply(_util.format, arguments);
  console.log(_chalk2.default.white(prefix), sep, msg);
}

exports.default = {
  log,
  fatal,
  success
};