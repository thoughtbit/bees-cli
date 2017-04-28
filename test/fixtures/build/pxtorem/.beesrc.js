import pxtorem from 'postcss-pxtorem';

export default {
  user: null,
  extraPostCSSPlugins: [
    pxtorem({
      rootValue: 100,
      propWhiteList: []
    })
  ]
}
