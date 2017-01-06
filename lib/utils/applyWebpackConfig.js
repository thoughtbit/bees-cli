const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
require('./registerBabel')

function warnIfExists () {
  const filePath = path.resolve('webpack.config.js')
  if (fs.existsSync(filePath)) {
    console.log(chalk.yellow(`警告：⚠️ ⚠️ ⚠️  不推荐通过 ${chalk.bold('webpack.config.js')} 以编码的方式进行配置, 因为 bee 本身的 major 或 minor 升级可能会导致不兼容。如果你坚持这样做,请小心 bee 升级后的兼容性问题。`))
    console.log()
  }
}

module.exports = function (config, env) {
  const filePath = path.resolve('webpack.config.js')
  if (fs.existsSync(filePath)) {
    return require(filePath)(config, env)
  } else {
    return config
  }
}

module.exports.warnIfExists = warnIfExists
