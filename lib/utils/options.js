'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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
  const json = _path2.default.join(dir, 'meta.json');
  const js = _path2.default.join(dir, 'meta.js');
  let opts = {};

  if ((0, _fs.existsSync)(json)) {
    opts = _readMetadata2.default.sync(json);
  } else if ((0, _fs.existsSync)(js)) {
    const req = require(_path2.default.resolve(js));
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
  const prompts = opts.prompts || (opts.prompts = {});
  if (!prompts[key] || typeof prompts[key] !== 'object') {
    prompts[key] = {
      'type': 'string',
      'default': val
    };
  } else {
    prompts[key]['default'] = val;
  }
}

function setValidateName(opts) {
  const name = opts.prompts.name;
  const customValidate = name.validate;
  name.validate = function (name) {
    const its = (0, _validateNpmPackageName2.default)(name);
    if (!its.validForNewPackages) {
      const errors = (its.errors || []).concat(its.warnings || []);
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
  const opts = getMetadata(dir);

  setDefault(opts, 'name', name);
  setValidateName(opts);

  const author = (0, _gitUser2.default)();
  if (author) {
    setDefault(opts, 'author', author);
  }

  return opts;
}

exports.default = options;