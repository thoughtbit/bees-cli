export default function (config, paths) {
  const baseWebpackConfig = {
    resolve: {
      extensions: ['.js', '.json', '.jsx', '.ts', '.tsx', '.vue'],
      alias: {
        '@': paths.resolveApp('src')
      }
    },
    module: {
      rules: [
        {
          exclude: [
            /\.html$/,
            /\.(js|jsx|vue)$/,
            /\.tsx?$/,
            /\.(css|less|scss)$/,
            /\.svg$/,
            /\.json$/
          ],
          loader: 'url-loader',
          query: {
            limit: 10000,
            name: 'static/[name].[hash:8].[ext]'
          }
        },
        {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          loader: 'image-webpack-loader?bypassOnDebug&optimizationLevel=7&interlaced=false'
        },
        {
          test: /\.(js|jsx})$/,
          include: paths.appSrc,
          loader: 'babel-loader'
        },
        {
          test: /\.html$/,
          loader: 'file-loader?name=[name].[ext]'
        },
        {
          test: /\.svg$/,
          loader: 'file-loader',
          query: {
            name: 'static/[name].[hash:8].[ext]'
          }
        },
        {
          test: /\.tsx?$/,
          include: paths.appSrc,
          loader: 'babel-loader!awesome-typescript'
        }
      ]
    },
    node: {
      fs: 'empty',
      net: 'empty',
      tls: 'empty'
    }
  }

  if (config.use === 'vue') {
    baseWebpackConfig.module.rules.push({
      test: /\.vue$/,
      loader: 'vue-loader',
      options: {
        loaders: config.vueLoaders
      }
    })
  }

  return baseWebpackConfig
}
