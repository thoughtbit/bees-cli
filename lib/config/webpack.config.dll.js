'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.default = function (argv, rcConfig, paths) {
  const appBuild = paths.dllNodeModule;
  const pkg = require((0, _path.join)(paths.appDirectory, 'package.json')); // eslint-disable-line

  const { name, include, exclude } = rcConfig.dllPlugin || {};

  const dependencyNames = (0, _keys2.default)(pkg.dependencies);
  const includeDependencies = (0, _lodash4.default)(dependencyNames.concat(include || []));

  const entry = {};
  entry[name] = (0, _lodash2.default)(includeDependencies, exclude);

  return {
    entry,
    output: {
      path: appBuild,
      filename: '[name].dll.js',
      library: '[name]'
    },
    module: {
      rules: []
    },
    plugins: [new _webpack2.default.optimize.ModuleConcatenationPlugin(), new _webpack2.default.DllPlugin({
      path: (0, _path.join)(appBuild, '[name].json'),
      name: '[name]',
      context: paths.appSrc
    })],
    resolve: {
      modules: [paths.appSrc, 'node_modules', paths.appNodeModules].concat(paths.nodePaths)
    }
  };
};

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _path = require('path');

var _lodash = require('lodash.pullall');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.uniq');

var _lodash4 = _interopRequireDefault(_lodash3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }