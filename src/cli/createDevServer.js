import fs from 'fs'
import { join } from 'path'
import clearConsole from 'react-dev-utils/clearConsole'
import {
  choosePort,
  createCompiler,
  prepareProxy,
  prepareUrls
} from 'react-dev-utils/WebpackDevServerUtils'
import openBrowser from 'react-dev-utils/openBrowser'
import noopServiceWorkerMiddleware from 'react-dev-utils/noopServiceWorkerMiddleware'
import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import chalk from 'chalk'
import chokidar from 'chokidar'
import getPaths from './../config/paths'
import getConfig from './../utils/getConfig'
import applyWebpackConfig, { warnIfExists } from './../utils/applyWebpackConfig'
import WebpackDevConfig from './../config/webpack.config.dev'
import { applyMock, outputError as outputMockError } from './../utils/mock'

// process.noDeprecation = true
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

// Tools like Cloud9 rely on this.
const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 12306
const HOST = process.env.HOST || '0.0.0.0'
const protocol = process.env.HTTPS === 'true' ? 'https' : 'http'

const isInteractive = process.stdout.isTTY

const cwd = process.cwd()
const paths = getPaths(cwd)
let compiler

const argv = require('yargs')
  .usage('Usage: bees server [options]')
  .option('open', {
    type: 'boolean',
    describe: 'Open url in browser after started',
    default: true
  })
  .help('h')
  .argv

let rcConfig
let config

// 命令设置是否清屏
function clearConsoleWrapped () {
  if (process.env.CLEAR_CONSOLE !== 'none') {
    clearConsole()
  }
}

function readRcConfig () {
  try {
    rcConfig = getConfig(process.env.NODE_ENV, cwd)
  } catch (e) {
    console.log(chalk.red('Failed to parse .beesrc config.'))
    console.log()
    console.log(e.message)
    process.exit(1)
  }

  if (rcConfig.dllPlugin && !fs.existsSync(join(paths.dllNodeModule, `${rcConfig.dllPlugin.name}.json`))) {
    console.log(chalk.red('Failed to start the server, since you have enabled dllPlugin, but have not run `bees build-dll` before `bees server`.'))
    process.exit(1)
  }

  if (!rcConfig.use) {
    rcConfig['use'] = rcConfig.use ? rcConfig.use : 'react'
    console.log(chalk.red(`你没有在${chalk.yellow('.beesrc')}中定义${chalk.cyan('use')}, 默认值是${chalk.cyan(`${rcConfig.use}`)}.`))
    // process.exit(1)
  }

  if (!rcConfig.style) {
    rcConfig['style'] = rcConfig.style ? rcConfig.style : ['css', 'less']
    console.log(chalk.red(`你没有在${chalk.yellow('.beesrc')}中定义${chalk.cyan('style')},  默认值是${chalk.cyan(`["css", "less"]`)}.`))
    // process.exit(1)
  }
}

function readWebpackConfig () {
  config = applyWebpackConfig(WebpackDevConfig(rcConfig, cwd), process.env.NODE_ENV)
}

function setupWatch (devServer) {
  const files = [
    paths.resolveApp('.beesrc'),
    paths.resolveApp('.beesrc.js'),
    paths.resolveApp('webpack.config.js')
  ]
  const watcher = chokidar.watch(files, {
    ignored: /node_modules/,
    persistent: true
  })
  watcher.on('change', (path) => {
    console.log(chalk.green(`File ${path.replace(paths.appDirectory, '.')} changed, try to restart server`))
    watcher.close()
    devServer.close()
    process.send('RESTART')
  })
}

function createDevServerConfig (proxy, allowedHost) {
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
    setup (app) {
      app.use(noopServiceWorkerMiddleware())
    }
  }
}

function init () {
  // 读取配置文件
  readRcConfig()
  readWebpackConfig()

  // We attempt to use the default port but if it is busy, we offer the user to
  // run on a different port. `detect()` Promise resolves to the next free port.
  choosePort(HOST, DEFAULT_PORT)
    .then(port => {
      if (port == null) {
        // We have not found a port.
        return
      }
      const protocol = process.env.HTTPS === 'true' ? 'https' : 'http'
      const appName = require(paths.appPackageJson).name
      const urls = prepareUrls(protocol, HOST, port)
      const host = urls.lanUrlForConfig
      const useYarn = fs.existsSync(paths.yarnLockFile)

      // Create a webpack compiler that is configured with custom messages.
      const compiler = createCompiler(webpack, config, appName, urls, useYarn)
      compiler.plugin('done', () => {
        warnIfExists()
        if (isInteractive) {
          outputMockError()
        }
      })
      // Load proxy config
      const proxySetting = require(paths.appPackageJson).proxy
      const proxyConfig = prepareProxy(proxySetting, paths.appPublic)
      const proxy = rcConfig.proxy ? rcConfig.proxy : proxyConfig
      // Serve webpack assets generated by the compiler over a web sever.
      const serverConfig = createDevServerConfig(
        proxy,
        urls.lanUrlForConfig
      )
      const devServer = new WebpackDevServer(compiler, serverConfig)

      // 模拟数据服务
      applyMock(devServer)

      // Launch WebpackDevServer.
      devServer.listen(port, HOST, err => {
        if (err) {
          return console.log(err)
        }
        if (isInteractive) {
          clearConsoleWrapped()
        }
        console.log(chalk.cyan('Starting the development server...\n'))
        console.log()
        if (isInteractive) {
          outputMockError()
        }
        if (argv.open) {
          openBrowser(urls.localUrlForBrowser)
        }
      })

      // 配置文件监听
      setupWatch(devServer, port);

      // 退出服务
      ['SIGINT', 'SIGTERM'].forEach(function (sig) {
        process.on(sig, function () {
          devServer.close()
          process.exit()
        })
      })
    })
    .catch(err => {
      if (err && err.message) {
        console.log(err.message)
      }
      process.exit(1)
    })
}

init()
