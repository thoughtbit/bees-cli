if (process.env.NODE_ENV !== 'test') {
  require('babel-register')({
    only: /(webpack.config.js|.beesrc.js|.beesrc.mock.js|mock\/)/,
    presets: [
      require.resolve('babel-preset-env'),
      require.resolve('babel-preset-stage-2')
    ],
    plugins: [
      require.resolve('babel-plugin-transform-runtime')
    ],
    babelrc: false
  })
}
