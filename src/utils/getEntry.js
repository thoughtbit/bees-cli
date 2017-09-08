import { basename, sep } from 'path'
import assert from 'assert'
import glob from 'glob'
import isPlainObject from 'is-plain-object'

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
    // return files.map((file) => {
    //   return (file.charAt(0) === '.') ? file : `.${sep}${file}`
    // })
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
  // support write object for entry
  if (isPlainObject(entry)) {
    if (isBuild) {
      return entry
    }

    return Object.keys(entry).reduce((memo, key) => (!Array.isArray(entry[key]) ? ({
      ...memo,
      [key]: [
        require.resolve('react-dev-utils/webpackHotDevClient'),
        entry[key]
      ]
    }) : ({
      ...memo,
      [key]: entry[key]
    })), {})
  }
  const files = entry ? getFiles(paths.resolveApp(entry), appDirectory) : [paths.appIndexJs]
  return getEntries(files, isBuild)
}
