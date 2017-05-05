'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (config, paths) {
  var baseWebpackConfig = {
    context: paths.appSrc,
    resolve: {
      // This allows you to set a fallback for where Webpack should look for modules.
      // We read `NODE_PATH` environment variable in `paths.js` and pass paths here.
      // We placed these paths second because we want `node_modules` to "win"
      // if there are any conflicts. This matches Node resolution mechanism.
      // https://github.com/facebookincubator/create-react-app/issues/253
      modules: [paths.appSrc, 'node_modules', paths.appNodeModules].concat(paths.nodePaths),
      extensions: ['.js', '.json', '.jsx', '.ts', '.tsx', '.vue'],
      alias: {
        '~': paths.appSrc
      }
    },
    // Resolve loaders (webpack plugins for CSS, images, transpilation) from the
    // directory of `bees-cli` itself rather than the project directory.
    resolveLoader: {
      modules: [paths.ownNodeModules,
      // Lerna hoists everything, so we need to look in our app directory
      paths.appNodeModules]
    },
    module: {
      rules: [{
        test: /\.(js|jsx})$/,
        include: paths.appSrc,
        loader: 'babel-loader',
        options: {
          cacheDirectory: './.webpack_cache/'
        }
      }, {
        test: /\.tsx?$/,
        include: paths.appSrc,
        loader: 'babel-loader!awesome-typescript',
        options: {
          cacheDirectory: './.webpack_cache/'
        },
        exclude: /node_modules/
      },
      // ** ADDING/UPDATING LOADERS **
      // The "url" loader handles all assets unless explicitly excluded.
      // The `exclude` list *must* be updated with every change to loader extensions.
      // When adding a new loader, you must add its `test`
      // as a new entry in the `exclude` list for "url" loader.

      // "file" loader makes sure those assets get served by WebpackDevServer.
      // When you `import` an asset, you get its (virtual) filename.
      // In production, they would get copied to the `build` folder.
      {
        exclude: [/\.html$/, /\.(js|jsx|vue)$/, /\.css$/, /\.json$/, /\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
        loader: 'file-loader',
        options: {
          name: 'static/[name].[hash:8].[ext]'
        }
      }, {
        test: /\.html$/,
        loader: 'file?name=[name].[ext]'
      }]
    },
    node: {
      fs: 'empty',
      net: 'empty',
      tls: 'empty'
    }
  };

  return baseWebpackConfig;
};