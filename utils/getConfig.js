const merge = require('webpack-merge')
const pathExists = require('path-exists')
const fs = require('fs')
const explain = require('explain-error')
const stripJsonComments = require('strip-json-comments')
const getPath = require('./../utils/getPath')

function realGetConfig (fileName, env = 'development') {
  const configPath = getPath.resolveApp(fileName)
  if (pathExists.sync(configPath)) {
    try {
      const result = JSON.parse(stripJsonComments(fs.readFileSync(configPath, 'utf-8')))
      if (result.env) {
        if (result.env[env]) merge(result, result.env[env])
        delete result.env
      }
      return result
    } catch (e) {
      throw explain(e, `Config path ${fileName} parse error.`)
    }
  } else {
    return {}
  }
}

module.exports = function () {
  return realGetConfig('.beerc', process.env.NODE_ENV)
}

module.exports.realGetConfig = realGetConfig
