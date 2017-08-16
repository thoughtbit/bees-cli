import { join } from 'path'
import winPath from './winPath'

const cwd = process.cwd()
const files = [
  'webpack.config.js',
  '.beesrc.js',
  '.beesrc.mock.js',
  winPath(join(cwd, 'mock')),
  winPath(join(cwd, 'src'))
]

if (process.env.NODE_ENV !== 'test') {
  require('babel-register')({
    only: new RegExp(`(${files.join('|')})`),
    presets: [
      // Latest stable ECMAScript features
      [
        require.resolve('babel-preset-env'),
        {
          node: 'current'
        }
      ],
      require.resolve('babel-preset-stage-0')
    ],
    plugins: [
      require.resolve('babel-plugin-transform-runtime')
    ],
    babelrc: false
  })
}
