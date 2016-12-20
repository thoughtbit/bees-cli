const path = require('path')
const fs = require('fs')

module.exports.appDirectory = fs.realpathSync(process.cwd())

module.exports.resolveApp = function (relativePath) {
  return path.resolve(exports.appDirectory, relativePath)
}

module.exports.resolveOwn = function (relativePath) {
  return path.resolve(__dirname, relativePath)
}

module.exports.assetsPath = function (assetsSubDirectory, relativePath) {
  return path.posix.join(assetsSubDirectory, relativePath)
}
