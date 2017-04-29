'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _eval = require('./eval');

var _eval2 = _interopRequireDefault(_eval);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Support types from prompt-for which was used before
var promptMapping = {
  string: 'input',
  boolean: 'confirm'
};

/**
 * Inquirer prompt wrapper.
 *
 * @param {Object} data
 * @param {String} key
 * @param {Object} prompt
 * @param {Function} done
 */

function prompt(data, key, prompt, done) {
  // skip prompts whose when condition is not met
  if (prompt.when && !(0, _eval2.default)(prompt.when, data)) {
    return done();
  }

  var promptDefault = prompt.default;
  if (typeof prompt.default === 'function') {
    promptDefault = function promptDefault() {
      return prompt.default.bind(this)(data);
    };
  }

  _inquirer2.default.prompt([{
    type: promptMapping[prompt.type] || prompt.type,
    name: key,
    message: prompt.message || prompt.label || key,
    default: promptDefault,
    choices: prompt.choices || [],
    validate: prompt.validate || function () {
      return true;
    }
  }], function (answers) {
    if (Array.isArray(answers[key])) {
      data[key] = {};
      answers[key].forEach(function (multiChoiceAnswer) {
        data[key][multiChoiceAnswer] = true;
      });
    } else {
      data[key] = answers[key];
    }
    done();
  });
}

/**
 * Ask questions, return results.
 *
 * @param {Object} prompts
 * @param {Object} data
 * @param {Function} done
 */

function ask(prompts, data, done) {
  _async2.default.eachSeries((0, _keys2.default)(prompts), function (key, next) {
    prompt(data, key, prompts[key], next);
  }, done);
}

exports.default = ask;