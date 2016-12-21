const path = require('path')
const fs = require('fs')

const appDirectory = fs.realpathSync(process.cwd())

function resolveApp (relativePath) {
  return path.resolve(appDirectory, relativePath)
}

function resolveOwn (relativePath) {
  return path.resolve(__dirname, relativePath)
}

module.exports = {
  appSrc: resolveApp('src'),
  appBuild: resolveApp('dist'),
  appPublic: resolveApp('public'),
  appPackageJson: resolveApp('package.json'),
  appNodeModules: resolveApp('node_modules'),
  ownNodeModules: resolveOwn('../node_modules'),
  productionSourceMap: true,
  productionGzip: false,
  productionGzipExtensions: ['js', 'css'],
  cssSourceMap: false,
  appDirectory,
  resolveApp,
  resolveOwn
}
