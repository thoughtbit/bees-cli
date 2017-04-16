'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (config, paths) {
  return {
    resolve: {
      extensions: ['.js', '.json', '.jsx', '.ts', '.tsx', ''],
      alias: {
        'src': paths.resolveApp('./../src'),
        'assets': paths.resolveApp('./../src/assets'),
        'components': paths.resolveApp('./../src/components')
      }
    },
    resolveLoader: {
      root: [paths.ownNodeModules, paths.appNodeModules]
    },
    module: {
      loaders: [{
        exclude: [/\.html$/, /\.(js|jsx)$/, /\.tsx?$/, /\.(css|less|scss)$/, /\.json$/, /\.(png|jpe?g|gif|svg)(\?.*)?$/, /\.(woff2?|eot|ttf|otf)(\?.*)?$/],
        loader: 'url',
        query: {
          limit: 10000,
          name: 'static/[name].[hash:8].[ext]'
        }
      }, {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
      }, {
        test: /\.(js|jsx)$/,
        include: paths.appSrc,
        loader: 'babel'
      }, {
        test: /\.html$/,
        loader: 'file?name=[name].[ext]'
      }, {
        test: /\.json$/,
        loader: 'json'
      }, {
        test: /\.svg$/,
        loader: 'file',
        query: {
          name: 'static/[name].[hash:8].[ext]'
        }
      }, {
        test: /\.tsx?$/,
        include: paths.appSrc,
        loader: 'babel!awesome-typescript'
      }]
    },
    babel: {
      presets: [require.resolve('babel-preset-es2015'), require.resolve('babel-preset-stage-0')].concat(config.extraBabelPresets || []),
      plugins: [require.resolve('babel-plugin-add-module-exports')].concat(config.extraBabelPlugins || []),
      cacheDirectory: true
    },
    node: {
      fs: 'empty',
      net: 'empty',
      tls: 'empty'
    }
  };
};