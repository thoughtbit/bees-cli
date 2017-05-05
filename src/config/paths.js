import { isAbsolute, resolve } from 'path'
import { realpathSync } from 'fs'

/* 修改正 create-react-app 中多一层目录 */
function resolveOwn (relativePath) {
  return resolve(__dirname, relativePath)
}

export default function getPaths (cwd) {
  const appDirectory = realpathSync(cwd)

  function resolveApp (relativePath) {
    return resolve(appDirectory, relativePath)
  }

  // We support resolving modules according to `NODE_PATH`.
  // This lets you use absolute paths in imports inside large monorepos:
  // https://github.com/facebookincubator/create-react-app/issues/253.

  // It works similar to `NODE_PATH` in Node itself:
  // https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders

  // We will export `nodePaths` as an array of absolute paths.
  // It will then be used by Webpack configs.
  // Jest doesn’t need this because it already handles `NODE_PATH` out of the box.

  // Note that unlike in Node, only *relative* paths from `NODE_PATH` are honored.
  // Otherwise, we risk importing Node.js core modules into an app instead of Webpack shims.
  // https://github.com/facebookincubator/create-react-app/issues/1023#issuecomment-265344421

  const nodePaths = (process.env.NODE_PATH || '')
    .split(process.platform === 'win32' ? ';' : ':')
    .filter(Boolean)
    .filter(folder => !isAbsolute(folder))
    .map(resolveApp)

  return {
    appSrc: resolveApp('src'),
    appBuild: resolveApp('dist'),
    appPublic: resolveApp('public'),
    appIndexJs: resolveApp('src/index.js'),
    appPackageJson: resolveApp('package.json'),
    appNodeModules: resolveApp('node_modules'),
    ownNodeModules: resolveOwn('../../node_modules'),
    dllNodeModule: resolveApp('node_modules/bees-dlls'),
    nodePaths: nodePaths,
    appDirectory,
    resolveApp,
    resolveOwn
  }
}
