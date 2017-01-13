'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getPaths;

var _path = require('path');

var _fs = require('fs');

function resolveOwn(relativePath) {
  return (0, _path.resolve)(__dirname, relativePath);
}

function getPaths(cwd) {
  var appDirectory = (0, _fs.realpathSync)(cwd);

  function resolveApp(relativePath) {
    return (0, _path.resolve)(appDirectory, relativePath);
  }

  return {
    appSrc: resolveApp('src'),
    appBuild: resolveApp('dist'),
    appPublic: resolveApp('public'),
    appPackageJson: resolveApp('package.json'),
    appNodeModules: resolveApp('node_modules'),
    ownNodeModules: resolveOwn('../node_modules'),
    appDirectory: appDirectory,
    resolveApp: resolveApp,
    resolveOwn: resolveOwn
  };
}