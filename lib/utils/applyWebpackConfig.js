import { existsSync } from 'fs'
import { resolve } from 'path'
import chalk from 'chalk'

require('./registerBabel')

export function warnIfExists () {
  const filePath = resolve('webpack.config.js')
  if (existsSync(filePath)) {
    console.log(chalk.yellow(`警告：⚠️ ⚠️ ⚠️  不推荐通过 ${chalk.bold('webpack.config.js')} 以编码的方式进行配置, 因为 bee 本身的 major 或 minor 升级可能会导致不兼容。如果你坚持这样做,请小心 bee 升级后的兼容性问题。`))
    console.log()
  }
}

export default function applyWebpackConfig (config, env) {
  const filePath = resolve('webpack.config.js')
  if (existsSync(filePath)) {
    return require(filePath)(config, env);  // eslint-disable-line
  } else {
    return config
  }
}
