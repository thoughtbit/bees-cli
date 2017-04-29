import match from 'minimatch'
import evaluate from './eval'

export default function (files, filters, data, done) {
  if (!filters) {
    return done()
  }
  const fileNames = Object.keys(files)
  Object.keys(filters).forEach(function (glob) {
    fileNames.forEach(function (file) {
      if (match(file, glob, { dot: true })) {
        const condition = filters[glob]
        if (!evaluate(condition, data)) {
          delete files[file]
        }
      }
    })
  })
  done()
}
