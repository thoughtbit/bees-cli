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
      },
      plugins: [
      // Prevents users from importing files from outside of src/ (or node_modules/).
      // This often causes confusion because we only process files within src/ with babel.
      // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
      // please link the files into your node_modules/ and let module-resolution kick in.
      // Make sure your source files are compiled, as they will not be processed in any way.
      new _ModuleScopePlugin2.default(paths.appSrc)]
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
        test: /\.jsx?$/,
        include: paths.appSrc,
        loader: 'babel-loader',
        options: {
          cacheDirectory: './.webpack_cache/'
        }
      }, {
        test: /\.tsx?$/,
        include: paths.appSrc,
        loader: 'ts-loader',
        options: {
          cacheDirectory: './.webpack_cache/',
          appendTsSuffixTo: [/\.vue$/]
        }
      },
      // "file" loader makes sure those assets get served by WebpackDevServer.
      // When you `import` an asset, you get its (virtual) filename.
      // In production, they would get copied to the `build` folder.
      {
        exclude: [/\.html$/, /\.(js|jsx)$/, /\.(ts|tsx)$/, /\.vue$/, /\.(css|less|sass|scss|styl)$/, /\.json$/, /\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
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

var _ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

var _ModuleScopePlugin2 = _interopRequireDefault(_ModuleScopePlugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }