'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _readMetadata = require('read-metadata');

var _readMetadata2 = _interopRequireDefault(_readMetadata);

var _validateNpmPackageName = require('validate-npm-package-name');

var _validateNpmPackageName2 = _interopRequireDefault(_validateNpmPackageName);

var _gitUser = require('./git-user');

var _gitUser2 = _interopRequireDefault(_gitUser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Gets the metadata from either a meta.json or meta.js file.
 *
 * @param  {String} dir
 * @return {Object}
 */

function getMetadata(dir) {
  var json = _path2.default.join(dir, 'meta.json');
  var js = _path2.default.join(dir, 'meta.js');
  var opts = {};

  if ((0, _fs.existsSync)(json)) {
    opts = _readMetadata2.default.sync(json);
  } else if ((0, _fs.existsSync)(js)) {
    var req = require(_path2.default.resolve(js));
    if (req !== Object(req)) {
      throw new Error('meta.js needs to expose an object');
    }
    opts = req;
  }

  return opts;
}

/**
 * Set the default value for a prompt question
 *
 * @param {Object} opts
 * @param {String} key
 * @param {String} val
 */

function setDefault(opts, key, val) {
  if (opts.schema) {
    opts.prompts = opts.schema;
    delete opts.schema;
  }
  var prompts = opts.prompts || (opts.prompts = {});
  if (!prompts[key] || (0, _typeof3.default)(prompts[key]) !== 'object') {
    prompts[key] = {
      'type': 'string',
      'default': val
    };
  } else {
    prompts[key]['default'] = val;
  }
}

function setValidateName(opts) {
  var name = opts.prompts.name;
  var customValidate = name.validate;
  name.validate = function (name) {
    var its = (0, _validateNpmPackageName2.default)(name);
    if (!its.validForNewPackages) {
      var errors = (its.errors || []).concat(its.warnings || []);
      return 'Sorry, ' + errors.join(' and ') + '.';
    }
    if (typeof customValidate === 'function') return customValidate(name);
    return true;
  };
}

/**
 * Read prompts metadata.
 *
 * @param {String} dir
 * @return {Object}
 */

function options(name, dir) {
  var opts = getMetadata(dir);

  setDefault(opts, 'name', name);
  setValidateName(opts);

  var author = (0, _gitUser2.default)();
  if (author) {
    setDefault(opts, 'author', author);
  }

  return opts;
}

exports.default = options;