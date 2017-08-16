'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.default = function () {
  let name;
  let email;

  try {
    name = (0, _child_process.execSync)('git config --get user.name');
    email = (0, _child_process.execSync)('git config --get user.email');
  } catch (e) {}

  name = name && (0, _stringify2.default)(name.toString().trim()).slice(1, -1);
  email = email && ' <' + email.toString().trim() + '>';
  return (name || '') + (email || '');
};

var _child_process = require('child_process');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }