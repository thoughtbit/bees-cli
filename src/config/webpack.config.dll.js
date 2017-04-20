import webpack from 'webpack'
import { join } from 'path'

import pullAll from 'lodash.pullall'
import uniq from 'lodash.uniq'

export default function (argv, rcConfig, paths) {
  const appBuild = paths.dllNodeModule
  const pkg = require(join(paths.appDirectory, 'package.json')) // eslint-disable-line

  const { name, include, exclude } = rcConfig.dllPlugin || {}

  const dependencyNames = Object.keys(pkg.dependencies)
  const includeDependencies = uniq(dependencyNames.concat(include || []))

  const entry = {}
  entry[name] = pullAll(includeDependencies, exclude)

  return {
    entry,
    output: {
      path: appBuild,
      filename: '[name].dll.js',
      library: '[name]'
    },
    plugins: [
      new webpack.DllPlugin({
        path: join(appBuild, '[name].json'),
        name: '[name]',
        context: paths.appSrc
      })
    ],
    resolve: {
      root: paths.appDirectory,
      modulesDirectories: ['node_modules']
    }
  }
}
