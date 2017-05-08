import { existsSync } from 'fs'
import { resolve } from 'path'
import chalk from 'chalk'

require('./registerBabel')

export function warnIfExists () {
  const filePath = resolve('webpack.config.js')
  if (existsSync(filePath)) {
    console.log(chalk.yellow(`警告：⚠️ 不推荐通过 ${chalk.red('webpack.config.js')} 以编码的方式进行配置。如果你坚持这样做,请小心 ${chalk.red('bees')} 升级后的兼容性问题。`))
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
