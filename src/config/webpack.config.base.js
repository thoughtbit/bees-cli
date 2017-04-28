export default function (config, paths) {
  const baseWebpackConfig = {
    resolve: {
      extensions: ['.js', '.json', '.jsx', '.ts', '.tsx', '.vue'],
      alias: {
        '@': paths.appSrc
      }
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx})$/,
          include: paths.appSrc,
          loader: 'babel-loader'
        },
        {
          test: /\.tsx?$/,
          include: paths.appSrc,
          loader: 'babel-loader!awesome-typescript'
        },
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
          test: /\.html$/,
          loader: 'file-loader?name=[name].[ext]'
        },
        {
          test: /\.svg$/,
          loader: 'file-loader',
          query: {
            name: 'static/[name].[hash:8].[ext]'
          }
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
    baseWebpackConfig.resolve.alias['vue$'] = 'vue/dist/vue.esm.js'
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
