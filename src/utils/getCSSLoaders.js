import ExtractTextPlugin from 'extract-text-webpack-plugin'

function cssLoaders (config, options) {
  options = options || {}
  let cssLoader = {
    loader: 'css-loader',
    options: {
      importLoaders: 1,
      modules: !!config.disableCSSModules,
      localIdentName: '[name]-[local]-[hash:base64:5]',
      minimize: process.env.NODE_ENV === 'production',
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders (loader, loaderOptions) {
    let loaders = [cssLoader]
    let use = config.use === 'vue' ? 'vue-' : ''
    if (loader) {
      loaders.push(
        { loader: 'postcss-loader' },
        {
          loader: loader + '-loader',
          options: Object.assign({}, loaderOptions, {
            sourceMap: options.sourceMap
          })
        }
      )
    } else {
      loaders.push(
        { loader: 'postcss-loader' }
      )
    }

    return ExtractTextPlugin.extract({
      use: loaders,
      fallback: `${use}style-loader`
    })
  }

  // http://vuejs.github.io/vue-loader/en/configurations/extract-css.html
  if (config.use === 'vue') {
    return {
      css: generateLoaders(),
      postcss: generateLoaders(),
      less: generateLoaders('less'),
      sass: generateLoaders('sass', { indentedSyntax: true }),
      scss: generateLoaders('sass'),
      stylus: generateLoaders('stylus'),
      styl: generateLoaders('stylus')
    }
  } else {
    return {
      css: generateLoaders(),
      less: generateLoaders('less'),
      sass: generateLoaders('sass', { indentedSyntax: true }),
      scss: generateLoaders('sass'),
      stylus: generateLoaders('stylus'),
      styl: generateLoaders('stylus')
    }
  }
}

// Generate loaders for standalone style files
function styleLoaders (config, options) {
  let output = {}
  const loaders = cssLoaders(config, options)
  for (let extension in loaders) {
    const loader = loaders[extension]
    const rule = {
      test: new RegExp('\\.' + extension + '$'),
      loader: loader
    }
    output[extension] = rule
  }
  return output
}

export default {
  cssLoaders,
  styleLoaders
}
