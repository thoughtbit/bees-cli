import ExtractTextPlugin from 'extract-text-webpack-plugin'

function cssLoaders (options) {
  options = options || {}
  // generate loader string to be used with extract text plugin
  function generateLoaders (loaders) {
    // if (options.postcss) {
    //   loaders.splice(1, 0, 'postcss')
    // }
    const sourceLoader = loaders.map(function (loader) {
      let extraParamChar
      if (/\?/.test(loader)) {
        loader = loader.replace(/\?/, '-loader?')
        extraParamChar = '&'
      } else {
        loader = loader + '-loader'
        extraParamChar = '?'
      }
      return loader + (options.sourceMap ? extraParamChar + 'sourceMap' : '')
    }).join('!')

    if (options.extract) {
      return ExtractTextPlugin.extract('vue-style-loader', sourceLoader)
    } else {
      return ['vue-style-loader', sourceLoader].join('!')
    }
  }

  return {
    css: generateLoaders(['css', 'postcss']),
    less: generateLoaders(['css', 'less', 'postcss', 'resolve-url']),
    sass: generateLoaders(['css', 'sass?indentedSyntax', 'postcss', 'resolve-url']),
    scss: generateLoaders(['css', 'sass', 'postcss', 'resolve-url']),
    stylus: generateLoaders(['css', 'stylus', 'postcss', 'resolve-url']),
    styl: generateLoaders(['css', 'stylus', 'postcss', 'resolve-url'])
  }
}

// Generate loaders for standalone style files (outside of .vue)
function styleLoaders (options) {
  let output = []
  const loaders = cssLoaders(options)
  for (const extension in loaders) {
    const loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      loader: loader
    })
  }
  return output
}

export default {
  cssLoaders,
  styleLoaders
}
