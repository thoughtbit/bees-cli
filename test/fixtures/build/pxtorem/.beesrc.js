import pxtorem from 'postcss-pxtorem';

export default {
  devtool: "",
  extraPostCSSPlugins: [
    require('postcss-flexbugs-fixes'),
    pxtorem({
      rootValue: 100,
      propWhiteList: [],
      selectorBlackList: []
    })
  ]
}
