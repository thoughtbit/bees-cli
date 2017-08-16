'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (done) {
  // Ensure minimum supported node version is used
  if (!_semver2.default.satisfies(process.version, _package2.default.engines.node)) {
    return console.log(_chalk2.default.red('  You must upgrade node to >=' + _package2.default.engines.node + '.x to use bees-cli'));
  }

  (0, _request2.default)({
    url: 'https://registry.npmjs.org/bees-cli',
    timeout: 1000
  }, function (err, res, body) {
    if (!err && res.statusCode === 200) {
      const latestVersion = JSON.parse(body)['dist-tags'].latest;
      const localVersion = _package2.default.version;
      if (_semver2.default.lt(localVersion, latestVersion)) {
        console.log(_chalk2.default.yellow('  A newer version of bees-cli is available.'));
        console.log();
        console.log('  latest:    ' + _chalk2.default.green(latestVersion));
        console.log('  installed: ' + _chalk2.default.red(localVersion));
        console.log();
        console.log('You can upgrade your CLI with:');
        if ((0, _getPackager2.default)() === 'yarn') {
          console.log(_chalk2.default.green('  yarn global upgrade bees-cli'));
        } else {
          console.log(_chalk2.default.green('  npm update -g bees-cli'));
        }
      }
    }
    done();
  });
};

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _getPackager = require('./../utils/getPackager');

var _getPackager2 = _interopRequireDefault(_getPackager);

var _package = require('./../../package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }