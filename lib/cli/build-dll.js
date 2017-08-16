'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _isNan = require('babel-runtime/core-js/number/is-nan');

var _isNan2 = _interopRequireDefault(_isNan);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.build = build;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _filesize = require('filesize');

var _filesize2 = _interopRequireDefault(_filesize);

var _gzipSize = require('gzip-size');

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _recursiveReaddir = require('recursive-readdir');

var _recursiveReaddir2 = _interopRequireDefault(_recursiveReaddir);

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

var _stripAnsi = require('strip-ansi');

var _stripAnsi2 = _interopRequireDefault(_stripAnsi);

var _paths = require('./../config/paths');

var _paths2 = _interopRequireDefault(_paths);

var _getConfig = require('./../utils/getConfig');

var _getConfig2 = _interopRequireDefault(_getConfig);

var _applyWebpackConfig = require('./../utils/applyWebpackConfig');

var _applyWebpackConfig2 = _interopRequireDefault(_applyWebpackConfig);

var _webpackConfig = require('./../config/webpack.config.dll');

var _webpackConfig2 = _interopRequireDefault(_webpackConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const argv = require('yargs').usage('Usage: bees build-dll [options]').help('h').argv;

let rcConfig;
let appBuild;
let config;

function build(argv) {
  const paths = (0, _paths2.default)(argv.cwd);

  try {
    rcConfig = (0, _getConfig2.default)(process.env.NODE_ENV, argv.cwd);
  } catch (e) {
    console.log(_chalk2.default.red('Failed to parse .beesrc config.'));
    console.log();
    console.log(e.message);
    process.exit(1);
  }

  if (!rcConfig.dllPlugin) {
    console.log(_chalk2.default.red('dllPlugin config not found in .beesrc'));
    process.exit(1);
  }

  appBuild = paths.dllNodeModule;
  config = (0, _applyWebpackConfig2.default)((0, _webpackConfig2.default)(argv, rcConfig, paths), process.env.NODE_ENV);

  return new _promise2.default(resolve => {
    // Clear babel cache directory
    _rimraf2.default.sync(paths.appBabelCache);
    // First, read the current file sizes in build directory.
    // This lets us display how much they changed later.
    (0, _recursiveReaddir2.default)(appBuild, (errors, fileNames) => {
      const previousSizeMap = (fileNames || []).filter(fileName => /\.(js|css)$/.test(fileName)).reduce((memo, fileName) => {
        const contents = _fsExtra2.default.readFileSync(fileName);
        const key = removeFileNameHash(fileName);
        memo[key] = (0, _gzipSize.sync)(contents);
        return memo;
      }, {});

      // Remove all content but keep the directory so that
      // if you're in it, you don't end up in Trash
      _fsExtra2.default.emptyDirSync(appBuild);

      // Start the webpack build
      realBuild(previousSizeMap, resolve, argv);
    });
  });
}

// Input: /User/dan/app/build/static/js/main.82be8.js
// Output: /static/js/main.js
function removeFileNameHash(fileName) {
  return fileName.replace(appBuild, '').replace(/\/?(.*)(\.\w+)(\.js|\.css)/, (match, p1, p2, p3) => p1 + p3);
}

// Input: 1024, 2048
// Output: "(+1 KB)"
function getDifferenceLabel(currentSize, previousSize) {
  const FIFTY_KILOBYTES = 1024 * 50;
  const difference = currentSize - previousSize;
  const fileSize = !(0, _isNan2.default)(difference) ? (0, _filesize2.default)(difference) : 0;
  if (difference >= FIFTY_KILOBYTES) {
    return _chalk2.default.red(`+${fileSize}`);
  } else if (difference < FIFTY_KILOBYTES && difference > 0) {
    return _chalk2.default.yellow(`+${fileSize}`);
  } else if (difference < 0) {
    return _chalk2.default.green(fileSize);
  } else {
    return '';
  }
}

// Print a detailed summary of build files.
function printFileSizes(stats, previousSizeMap) {
  const assets = stats.toJson().assets.filter(asset => /\.(js|css)$/.test(asset.name)).map(asset => {
    const fileContents = _fsExtra2.default.readFileSync(`${appBuild}/${asset.name}`);
    const size = (0, _gzipSize.sync)(fileContents);
    const previousSize = previousSizeMap[removeFileNameHash(asset.name)];
    const difference = getDifferenceLabel(size, previousSize);
    return {
      folder: _path2.default.join(appBuild, _path2.default.dirname(asset.name)),
      name: _path2.default.basename(asset.name),
      size,
      sizeLabel: (0, _filesize2.default)(size) + (difference ? ` (${difference})` : '')
    };
  });
  assets.sort((a, b) => b.size - a.size);
  const longestSizeLabelLength = Math.max.apply(null, assets.map(a => (0, _stripAnsi2.default)(a.sizeLabel).length));
  assets.forEach(asset => {
    let sizeLabel = asset.sizeLabel;
    const sizeLength = (0, _stripAnsi2.default)(sizeLabel).length;
    if (sizeLength < longestSizeLabelLength) {
      const rightPadding = ' '.repeat(longestSizeLabelLength - sizeLength);
      sizeLabel += rightPadding;
    }
    console.log(`  ${sizeLabel}  ${_chalk2.default.dim(asset.folder + _path2.default.sep)}${_chalk2.default.cyan(asset.name)}`);
  });
}

// Print out errors
function printErrors(summary, errors) {
  console.log(_chalk2.default.red(summary));
  console.log();
  errors.forEach(err => {
    console.log(err.message || err);
    console.log();
  });
}

function doneHandler(previousSizeMap, argv, resolve, err, stats) {
  if (err) {
    printErrors('Failed to compile.', [err]);
    process.exit(1);
  }

  if (stats.compilation.errors.length) {
    printErrors('Failed to compile.', stats.compilation.errors);
    process.exit(1);
  }

  (0, _applyWebpackConfig.warnIfExists)();

  // const jsonStats = stats.toJson()
  // print asset stats
  // fs.writeFileSync("stats.txt", JSON.stringify(jsonStats, " " , 4))
  console.log(_chalk2.default.green(`Compiled successfully in ${(stats.toJson().time / 1000).toFixed(1)}s.`));
  // console.log(stats.toString({
  //   cached: true,
  //   chunks: false, // Makes the dist much quieter
  //   colors: true,
  //   children: false // supress some plugin output
  // }))

  console.log();

  console.log('File sizes after gzip:');
  console.log();
  printFileSizes(stats, previousSizeMap);
  console.log();

  resolve();
}

// Create the production build and print the deployment instructions.
function realBuild(previousSizeMap, resolve, argv) {
  console.log('Creating dll bundle...');

  const compiler = (0, _webpack2.default)(config);
  const done = doneHandler.bind(null, previousSizeMap, argv, resolve);
  compiler.run(done);
}

// Run.
if (require.main === module) {
  build((0, _extends3.default)({}, argv, { cwd: process.cwd() }));
}