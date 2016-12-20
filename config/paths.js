const getPath = require('../utils/getPath')

module.exports = {
  appSrc: getPath.resolveApp('src'),
  appBuild: getPath.resolveApp('dist'),
  assetsPublicPath: getPath.resolveApp('public'),
  assetsPublicHtml: getPath.resolveApp('public/index.html'),
  assetsSubDirectory: 'static',
  appPackageJson: getPath.resolveApp('package.json'),
  appNodeModules: getPath.resolveApp('node_modules'),
  ownNodeModules: getPath.resolveOwn('../node_modules'),
  productionSourceMap: true,
  productionGzip: false,
  productionGzipExtensions: ['js', 'css'],
  cssSourceMap: false,
  getPath
}

/*
// .beerc 配置例子
{
  "entry": "src/index.js",
  "disableCSSModules": false,
  "less": false,
  "publicPath": "/",
  "autoprefixer": null,
  "proxy": null,
  "extraBabelPlugins": [
    "transform-runtime"
  ]
}
*/
