const fs = require('fs')
const path = require('path')
const mock = {}

fs.readdirSync(path.join(__dirname + '/routes')).forEach(function (file) {
  Object.assign(mock, require('./routes/' + file))
})

module.exports = mock
