'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _metalsmith = require('metalsmith');

var _metalsmith2 = _interopRequireDefault(_metalsmith);

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

var _multimatch = require('multimatch');

var _multimatch2 = _interopRequireDefault(_multimatch);

var _options = require('./options');

var _options2 = _interopRequireDefault(_options);

var _ask = require('./ask');

var _ask2 = _interopRequireDefault(_ask);

var _filter = require('./filter');

var _filter2 = _interopRequireDefault(_filter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var render = require('consolidate').handlebars.render;

// register handlebars helper
_handlebars2.default.registerHelper('if_eq', function (a, b, opts) {
  return a === b ? opts.fn(this) : opts.inverse(this);
});

_handlebars2.default.registerHelper('unless_eq', function (a, b, opts) {
  return a === b ? opts.inverse(this) : opts.fn(this);
});

/**
 * Create a middleware for asking questions.
 *
 * @param {Object} prompts
 * @return {Function}
 */

function askQuestions(prompts) {
  return function (files, metalsmith, done) {
    (0, _ask2.default)(prompts, metalsmith.metadata(), done);
  };
}

/**
 * Create a middleware for filtering files.
 *
 * @param {Object} filters
 * @return {Function}
 */

function filterFiles(filters) {
  return function (files, metalsmith, done) {
    (0, _filter2.default)(files, filters, metalsmith.metadata(), done);
  };
}

/**
 * Template in place plugin.
 *
 * @param {Object} files
 * @param {Metalsmith} metalsmith
 * @param {Function} done
 */

function renderTemplateFiles(skipInterpolation) {
  skipInterpolation = typeof skipInterpolation === 'string' ? [skipInterpolation] : skipInterpolation;
  return function (files, metalsmith, done) {
    var keys = (0, _keys2.default)(files);
    var metalsmithMetadata = metalsmith.metadata();
    _async2.default.each(keys, function (file, next) {
      // skipping files with skipInterpolation option
      if (skipInterpolation && (0, _multimatch2.default)([file], skipInterpolation, { dot: true }).length) {
        return next();
      }
      var str = files[file].contents.toString();
      // do not attempt to render files that do not have mustaches
      if (!/{{([^{}]+)}}/g.test(str)) {
        return next();
      }
      render(str, metalsmithMetadata, function (err, res) {
        if (err) return next(err);
        files[file].contents = new Buffer(res);
        next();
      });
    }, done);
  };
}

/**
 * Display template complete message.
 *
 * @param {String} message
 * @param {Object} data
 */

function logMessage(message, data) {
  if (!message) return;
  render(message, data, function (err, res) {
    if (err) {
      console.error('\n   Error when rendering template complete message: ' + err.message.trim());
    } else {
      console.log('\n' + res.split(/\r?\n/g).map(function (line) {
        return '   ' + line;
      }).join('\n'));
    }
  });
}

/**
 * Generate a template given a `src` and `dest`.
 *
 * @param {String} name
 * @param {String} src
 * @param {String} dest
 * @param {Function} done
 */

function generate(name, src, dest, done) {
  var opts = (0, _options2.default)(name, src);
  var metalsmith = (0, _metalsmith2.default)(_path2.default.join(src, 'template'));
  var data = (0, _assign2.default)(metalsmith.metadata(), {
    destDirName: name,
    inPlace: dest === process.cwd(),
    noEscape: true
  });

  opts.helpers && (0, _keys2.default)(opts.helpers).map(function (key) {
    _handlebars2.default.registerHelper(key, opts.helpers[key]);
  });

  metalsmith.use(askQuestions(opts.prompts)).use(filterFiles(opts.filters)).use(renderTemplateFiles(opts.skipInterpolation)).clean(false).source('.') // start from template root instead of `./src` which is Metalsmith's default for `source`
  .destination(dest).build(function (err) {
    done(err);
    logMessage(opts.completeMessage, data);
  });

  return data;
}

exports.default = generate;