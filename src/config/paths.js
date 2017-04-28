import { resolve } from 'path'
import { realpathSync } from 'fs'

function resolveOwn (relativePath) {
  return resolve(__dirname, relativePath)
}

export default function getPaths (cwd) {
  const appDirectory = realpathSync(cwd)

  function resolveApp (relativePath) {
    return resolve(appDirectory, relativePath)
  }

  return {
    appSrc: resolveApp('vue'),
    // appSrc: resolveApp('src'),
    appBuild: resolveApp('dist'),
    appPublic: resolveApp('public'),
    appPackageJson: resolveApp('package.json'),
    appNodeModules: resolveApp('node_modules'),
    ownNodeModules: resolveOwn('../../node_modules'),
    dllNodeModule: resolveApp('node_modules/bees-dlls'),
    appDirectory,
    resolveApp,
    resolveOwn
  }
}
