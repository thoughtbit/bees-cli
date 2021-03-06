'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

var _uid = require('uid');

var _uid2 = _interopRequireDefault(_uid);

var _ora = require('ora');

var _ora2 = _interopRequireDefault(_ora);

var _downloadGitRepo = require('download-git-repo');

var _downloadGitRepo2 = _interopRequireDefault(_downloadGitRepo);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _logger = require('./../utils/logger');

var _logger2 = _interopRequireDefault(_logger);

var _checkVersion = require('./../utils/checkVersion');

var _checkVersion2 = _interopRequireDefault(_checkVersion);

var _generate = require('./../utils/generate');

var _generate2 = _interopRequireDefault(_generate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const argv = require('yargs').usage('Usage: bees init [options]').option('clone', {
  type: 'boolean',
  alias: 'c',
  describe: 'use git clone',
  default: false
}).help('h').argv;

function printUsageAndExit() {
  console.log(`${_chalk2.default.gray('==========================================================================\n')}
Usage:
    bees init ${_chalk2.default.gray('<template-name> [project-name]')}

Options:

    -h, --help   output usage information
    -c, --clone  use git clone

Examples:
${_chalk2.default.gray('    # create a new project with an official template')}
    $ bees init webpack my-project
  
${_chalk2.default.gray('    # create a new project straight from a github template')}
    $ bees init username/repo my-project
${_chalk2.default.gray('\n==========================================================================')}
`);
  process.exit(0);
}

/**
 * Help.
 */

function help() {
  if (argv._.length === 0 || argv.h === true) {
    printUsageAndExit();
  }
}
help();

/**
 * Padding.
 */

console.log();
process.on('exit', function () {
  console.log();
});

/**
 * Settings.
 */

const template = argv._[0];
const hasSlash = template.indexOf('/') > -1;
const rawName = argv._[1];
const inPlace = !rawName || rawName === '.';
const name = inPlace ? _path2.default.relative('../', process.cwd()) : rawName;
const to = _path2.default.resolve(rawName || '.');
const clone = argv.clone || false;

if ((0, _fs.existsSync)(to)) {
  _inquirer2.default.prompt([{
    type: 'confirm',
    message: inPlace ? '您确定要在当前目录生成项目吗?' : `您要创建的 ${_chalk2.default.red(`${rawName}`)} 项目已经存在了. 继续吗?`,
    name: 'ok'
  }], function (answers) {
    if (answers.ok) {
      run();
    }
  });
} else {
  run();
}

/**
 * Check, download and generate the project.
 */

function run() {
  // check if template is local
  if (/^[./]|(\w:)/.test(template)) {
    const templatePath = template.charAt(0) === '/' || /^\w:/.test(template) ? template : _path2.default.normalize(_path2.default.join(process.cwd(), template));
    if ((0, _fs.existsSync)(templatePath)) {
      (0, _generate2.default)(name, templatePath, to, function (err) {
        if (err) _logger2.default.fatal(err);
        console.log();
        _logger2.default.success('Generated "%s".', name);
      });
    } else {
      _logger2.default.fatal('Local template "%s" not found.', template);
    }
  } else {
    (0, _checkVersion2.default)(function () {
      if (!hasSlash) {
        // use official templates
        const officialTemplate = 'fis-templates/' + template;
        downloadAndGenerate(officialTemplate);
      } else {
        downloadAndGenerate(template);
      }
    });
  }
}

/**
 * Download a generate from a template repo.
 *
 * @param {String} template
 */

function downloadAndGenerate(template) {
  const tmp = _os2.default.tmpdir() + '/fis-template-' + (0, _uid2.default)();
  const spinner = (0, _ora2.default)('Downloading template...');
  spinner.start();
  (0, _downloadGitRepo2.default)(template, tmp, { clone: clone }, function (err) {
    spinner.stop();
    process.on('exit', function () {
      _rimraf2.default.sync(tmp);
    });
    if (err) _logger2.default.fatal('Failed to download repo ' + template + ': ' + err.message.trim());
    (0, _generate2.default)(name, tmp, to, function (err) {
      if (err) _logger2.default.fatal(err);
      console.log();
      _logger2.default.success('Generated "%s".', name);
    });
  });
}