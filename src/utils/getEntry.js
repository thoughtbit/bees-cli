import { basename, sep } from 'path'
import assert from 'assert'
import glob from 'glob'

function getEntry (filePath, isBuild) {
  const key = basename(filePath).replace(/\.(jsx?|tsx?)$/, '')
  const value = isBuild ? [require.resolve('./polyfills'), filePath] : [require.resolve('react-dev-utils/webpackHotDevClient'), require.resolve('./polyfills'), filePath]
  return {
    [key]: value
  }
}

export function getFiles (entry, cwd) {
  if (Array.isArray(entry)) {
    return entry.reduce((memo, entryItem) => {
      return memo.concat(getFiles(entryItem, cwd))
    }, [])
  } else {
    assert(
      typeof entry === 'string',
      `getEntry/getFiles: entry type should be string, but got ${typeof entry}`,
    )
    const files = glob.sync(entry, {
      cwd
    })
    return files
  }
}

export function getEntries (files, isBuild) {
  return files.reduce((memo, file) => {
    return Object.assign(memo, getEntry(file, isBuild))
  }, {})
}

export default function (config, paths, isBuild) {
  const appDirectory = paths.appDirectory
  const entry = config.entry
  const files = entry ? getFiles(paths.resolveApp(entry), appDirectory) : [paths.appIndexJs]
  return getEntries(files, isBuild)
}
