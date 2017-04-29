'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = evalualte;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Evaluate an expression in meta.json in the context of
 * prompt answers data.
 */

function evalualte(exp, data) {
  /* eslint-disable no-new-func */
  var fn = new Function('data', 'with (data) { return ' + exp + '}');
  try {
    return fn(data);
  } catch (e) {
    console.error(_chalk2.default.red('Error when evaluating filter condition: ' + exp));
  }
}