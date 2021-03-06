'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _clearConsole = require('react-dev-utils/clearConsole');

var _clearConsole2 = _interopRequireDefault(_clearConsole);

var _WebpackDevServerUtils = require('react-dev-utils/WebpackDevServerUtils');

var _openBrowser = require('react-dev-utils/openBrowser');

var _openBrowser2 = _interopRequireDefault(_openBrowser);

var _noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware');

var _noopServiceWorkerMiddleware2 = _interopRequireDefault(_noopServiceWorkerMiddleware);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _webpackDevServer = require('webpack-dev-server');

var _webpackDevServer2 = _interopRequireDefault(_webpackDevServer);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _paths = require('./../config/paths');

var _paths2 = _interopRequireDefault(_paths);

var _getConfig = require('./../utils/getConfig');

var _getConfig2 = _interopRequireDefault(_getConfig);

var _applyWebpackConfig = require('./../utils/applyWebpackConfig');

var _applyWebpackConfig2 = _interopRequireDefault(_applyWebpackConfig);

var _webpackConfig = require('./../config/webpack.config.dev');

var _webpackConfig2 = _interopRequireDefault(_webpackConfig);

var _mock = require('./../utils/mock');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

process.noDeprecation = true;
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Tools like Cloud9 rely on this.
const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 12306;
const HOST = process.env.HOST || '0.0.0.0';
const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';

const isInteractive = process.stdout.isTTY;

const cwd = process.cwd();
const paths = (0, _paths2.default)(cwd);
let compiler;

const argv = require('yargs').usage('Usage: bees server [options]').option('open', {
  type: 'boolean',
  describe: 'Open url in browser after started',
  default: true
}).help('h').argv;

let rcConfig;
let config;

// 命令设置是否清屏
function clearConsoleWrapped() {
  if (process.env.CLEAR_CONSOLE !== 'none') {
    (0, _clearConsole2.default)();
  }
}

function readRcConfig() {
  try {
    rcConfig = (0, _getConfig2.default)(process.env.NODE_ENV, cwd);
  } catch (e) {
    console.log(_chalk2.default.red('Failed to parse .beesrc config.'));
    console.log();
    console.log(e.message);
    process.exit(1);
  }

  if (rcConfig.dllPlugin && !_fs2.default.existsSync((0, _path.join)(paths.dllNodeModule, `${rcConfig.dllPlugin.name}.json`))) {
    console.log(_chalk2.default.red('Failed to start the server, since you have enabled dllPlugin, but have not run `bees build-dll` before `bees server`.'));
    process.exit(1);
  }

  if (!rcConfig.use) {
    rcConfig['use'] = rcConfig.use ? rcConfig.use : 'react';
    console.log(_chalk2.default.red(`你没有在${_chalk2.default.yellow('.beesrc')}中定义${_chalk2.default.cyan('use')}, 默认值是${_chalk2.default.cyan(`${rcConfig.use}`)}.`));
    // process.exit(1)
  }

  if (!rcConfig.style) {
    rcConfig['style'] = rcConfig.style ? rcConfig.style : ['css', 'less'];
    console.log(_chalk2.default.red(`你没有在${_chalk2.default.yellow('.beesrc')}中定义${_chalk2.default.cyan('style')},  默认值是${_chalk2.default.cyan(`["css", "less"]`)}.`));
    // process.exit(1)
  }
}

function readWebpackConfig() {
  config = (0, _applyWebpackConfig2.default)((0, _webpackConfig2.default)(rcConfig, cwd), process.env.NODE_ENV);
}

function setupWatch(devServer) {
  const files = [paths.resolveApp('.beesrc'), paths.resolveApp('.beesrc.js'), paths.resolveApp('webpack.config.js')];
  const watcher = _chokidar2.default.watch(files, {
    ignored: /node_modules/,
    persistent: true
  });
  watcher.on('change', path => {
    console.log(_chalk2.default.green(`File ${path.replace(paths.appDirectory, '.')} changed, try to restart server`));
    watcher.close();
    devServer.close();
    process.send('RESTART');
  });
}

function createDevServerConfig(proxy, allowedHost) {
  return {
    disableHostCheck: !proxy || process.env.DANGEROUSLY_DISABLE_HOST_CHECK === 'true',
    // Enable gzip compression of generated files.
    compress: true,
    clientLogLevel: 'none',
    contentBase: paths.appPublic,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'SourceMap,X-SourceMap'
    },
    hot: true,
    publicPath: config.output.publicPath,
    quiet: true,
    watchOptions: {
      ignored: /node_modules/
    },
    https: protocol === 'https',
    host: HOST,
    proxy,
    overlay: false,
    historyApiFallback: {
      disableDotRule: true
    },
    public: allowedHost,
    setup(app) {
      app.use((0, _noopServiceWorkerMiddleware2.default)());
    }
  };
}

function init() {
  // 读取配置文件
  readRcConfig();
  readWebpackConfig();

  // We attempt to use the default port but if it is busy, we offer the user to
  // run on a different port. `detect()` Promise resolves to the next free port.
  (0, _WebpackDevServerUtils.choosePort)(HOST, DEFAULT_PORT).then(port => {
    if (port == null) {
      // We have not found a port.
      return;
    }
    const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
    const appName = require(paths.appPackageJson).name;
    const urls = (0, _WebpackDevServerUtils.prepareUrls)(protocol, HOST, port);
    const host = urls.lanUrlForConfig;
    const useYarn = _fs2.default.existsSync(paths.yarnLockFile);

    // Create a webpack compiler that is configured with custom messages.
    const compiler = (0, _WebpackDevServerUtils.createCompiler)(_webpack2.default, config, appName, urls, useYarn);
    compiler.plugin('done', () => {
      (0, _applyWebpackConfig.warnIfExists)();
      if (isInteractive) {
        (0, _mock.outputError)();
      }
    });
    // Load proxy config
    const proxySetting = require(paths.appPackageJson).proxy;
    const proxyConfig = (0, _WebpackDevServerUtils.prepareProxy)(proxySetting, paths.appPublic);
    const proxy = rcConfig.proxy ? rcConfig.proxy : proxyConfig;
    // Serve webpack assets generated by the compiler over a web sever.
    const serverConfig = createDevServerConfig(proxy, urls.lanUrlForConfig);
    const devServer = new _webpackDevServer2.default(compiler, serverConfig);

    // 模拟数据服务
    (0, _mock.applyMock)(devServer);

    // Launch WebpackDevServer.
    devServer.listen(port, HOST, err => {
      if (err) {
        return console.log(err);
      }
      if (isInteractive) {
        clearConsoleWrapped();
      }
      console.log(_chalk2.default.cyan('Starting the development server...\n'));
      console.log();
      if (isInteractive) {
        (0, _mock.outputError)();
      }
      if (argv.open) {
        (0, _openBrowser2.default)(urls.localUrlForBrowser);
      }
    });

    // 配置文件监听
    setupWatch(devServer, port);

    // 退出服务
    ['SIGINT', 'SIGTERM'].forEach(function (sig) {
      process.on(sig, function () {
        devServer.close();
        process.exit();
      });
    });
  }).catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });
}

init();