# bees
A simple CLI for serve and build web app, support JSON pattern config.

一个简单的CLI工具，无需复杂的配置，轻松的构建和调试项目。

### 声明

Bees 是 [create-react-app](https://github.com/facebookincubator/create-react-app) 、 [roadhog](https://github.com/sorrycc/roadhog) 和 [vue-cli](https://github.com/vuejs/vue-cli) 的克隆版，根据团队和自己日常开发的需求修改而成的, 提供 init、 server、 build 和 test 四个命令，分别用于生成脚手架、本地调试和构建，并且提供了特别易用的 mock 功能。命令行体验同 vue-cli 和 roadhog 一致，但配置略有不同。让人兴奋的是同时支持 Vue 和 React 的构建与调试。如果你喜欢 TypeScript 编译，默认也是支持的。

### 安装

Prerequisites: [Node.js](https://nodejs.org/en/) (>=6.5, 7.x preferred) and [Git](https://git-scm.com/).

``` bash
$ npm install -g bees-cli
```

### 使用
脚手架

```bash
$ bees init
```

本地开发

```bash
$ bees server
```

打包发布

```bash
$ bees build
```

DllPlugin

```bash
$ bees build-dll
```

### Mock

bees server 支持 mock 功能，类似 [dora-plugin-proxy](https://github.com/dora-js/dora-plugin-proxy)，在 `.beesrc.mock.js` 中进行配置，支持基于 require 动态分析的实时刷新，支持 ES6 语法，以及友好的出错提示。

比如：

```js
export default {
  // 支持值为 Object 和 Array
  'GET /api/users': { users: [1,2] },

  // GET POST 可省略
  '/api/users/1': { id: 1 },

  // 支持自定义函数，API 参考 express@4
  'POST /api/users/create': (req, res) => { res.end('OK'); },

  // Forward 到另一个服务器
  'GET /assets/*': 'https://assets.online/',

  // Forward 到另一个服务器，并指定子路径
  // 请求 /someDir/0.0.50/index.css 会被代理到 https://g.alicdn.com/tb-page/taobao-home, 实际返回 https://g.alicdn.com/tb-page/taobao-home/0.0.50/index.css
  'GET /someDir/(.*)': 'https://g.alicdn.com/tb-page/taobao-home',
};
```

### 智能重启

配置文件修改的修改会触发 bees server 的自动重启，会触发重启的文件有：

* `.beesrc`
* `.beesrc.js`
* `.beesrc.mock.js`

### 配置

关于配置的一些基本概念：

* 配置存于 `.beesrc` 文件中（如果你不喜欢 JSON 配置，可以用 `.beesrc.js` 以 JS 的方式编写，支持 ES6）
* 格式为 `JSON`，允许注释
* 布尔类型的配置项默认值均为 `false`
* 支持通过 `webpack.config.js` 以编码的方式进行配置，但不推荐，因为 bees 本身的 major 或 minor 升级可能会引起兼容问题。使用时会给予警告⚠️⚠️⚠️， 。（`webpack.config.js` 本身的编写支持 ES6，会通过 babal-register 做一层转换。）

.beesrc 默认配置：

```json
{
  "use": "react",
  "entry": "src/index.js",
  "publicPath": "/",
  "outputPath": "./dist",
  "extraBabelPresets": [],
  "extraBabelPlugins": [],
  "extraPostCSSPlugins": [],
  "hash": false,
  "disableCSSModules": false,
  "cssSourceMap": false,
  "analyze": false,
  "autoprefixer": null,
  "externals": null,
  "library": null,
  "libraryTarget": "var",
  "multipage": false,
  "dllPlugin": null,
  "define": null,
  "proxy": null,
  "env": null,
}
```

.beesrc 的 React开发配置：

```json
{
  "use": "react",
  "entry": "src/index.js",
  "publicPath": "/",
  "extraBabelPresets": [
    "react"
  ],
  "extraBabelPlugins": [
    "react-require"
  ],
  "disableCSSModules": false,
  "autoprefixer": null,
  "externals": null,
  "multipage": true,
  "define": null,
  "proxy": null,
  "env": {
    "development": {
      "cssSourceMap": false
    },
    "production": {
      "cssSourceMap": true,
      "analyze": true
    }
  }
}
```

package.json 的 React开发配置：

```json
{
  "babel-preset-react": ""
}
```

.beesrc 的 Vue开发配置：

```json
{
  "use": "vue",
  "entry": "src/index.js",
  "publicPath": "/",
  "extraBabelPlugins": [
    "transform-vue-jsx",
    "transform-object-rest-spread"
  ],
  "disableCSSModules": false,
  "autoprefixer": null,
  "externals": null,
  "multipage": true,
  "define": null,
  "proxy": null,
  "env": {
    "development": {
      "cssSourceMap": false
    },
    "production": {
      "cssSourceMap": true,
      "analyze": true
    }
  }
}
```

package.json 的 Vue开发配置：

```json
{
  "babel-plugin-transform-vue-jsx": ""
}
```

### use 
指定当前使用的前端框架是`vue` 还是 `react`， 默认支持的是`react`

```
"use": "react"
```

### entry

指定 webpack 入口文件，支持 [glob](https://github.com/isaacs/node-glob) 格式。

如果你的项目是多页类型，会希望把 `src/pages` 的文件作为入口。可以这样配：

```
"entry": "src/pages/*.js"
```

注意： entry 默认已经导入了一些polyfills，包括 `object-assign`， `promise`， `whatwg-fetch` 。这样我们就可以放心的使用 `Object.assign()`，`fetch()`，`new Promise()` ，不用担心浏览器是否支持的问题了。

### disableCSSModules

禁用 [CSS Modules](https://github.com/css-modules/css-modules)。最好别关，熟悉并使用他后，你会发现写样式简单了很多。

### publicPath

配置生产环境的 [publicPath](http://webpack.github.io/docs/configuration.html#output-publicpath)，开发环境下永远为 `/`。

### extraBabelPlugins

配置额外的 babel plugin。babel plugin 只能添加，不允许覆盖和删除。

```
"extraBabelPlugins": ["transform-runtime"],
"env": {
  "development": {
    "extraBabelPlugins": ["dva-hmr"]
  }
}
```
这样，开发环境下的 extraBabelPlugins 是 `["transform-runtime", "dva-hmr"]`，而生产环境下是 `["transform-runtime"]`。

### extraResolveExtensions
配置额外的 extensions。
```
  "extraResolveExtensions": ['.web.js', '.web.jsx', '.web.ts', '.web.tsx']
```

### style
样式预编译器，默认支持css 和 less. sass[scss] 和 stylus[styl] 由npm-install-webpack-plugin自动安装

```
style: ["css", "less","sass","stylus"]
```

### extraPostCSSPlugins

配置额外的 postcss 插件。

注意：由于 postcss 的插件是以函数的方式进行配置的，所以这个配置只能在 `.beesrc.js` 里使用。

比如：

```
import pxtorem from 'postcss-pxtorem'
extraPostCSSPlugins: [
  pxtorem({
    rootValue: 100,
    propWhiteList: [],
  }),
],
```


### hash

使用 hash 文件名。

```
"hash": true
```

### autoprefixer

配置 autoprefixer 参数，详见 [autoprefixer](https://github.com/postcss/autoprefixer) 和 [browserslist](https://github.com/ai/browserslist#queries)。

比如，如果是做移动端的开发，可以配成：

```
"autoprefixer": {
  "browsers": [
    "iOS >= 8", "Android >= 4"
  ]
}
```

### imgCompress

生产环境是否开启图片压缩,默认没有开启, 如果设置为`true`是开启图片压缩模式的。

```
"imgCompress": true
```

### proxy

配置代理，详见 [webpack-dev-server#proxy](https://webpack.github.io/docs/webpack-dev-server.html#proxy)。(注意：仅支持 JSON 格式的配置，不支持 `bypass`。)

如果要代理请求到其他服务器，可以这样配：

```
"proxy": {
  "/api": {
    "target": "http://jsonplaceholder.typicode.com/",
    "changeOrigin": true,
    "pathRewrite": { "^/api" : "" }
  }
}
```

此配置也可以配置到 `package.json` 中，支持 prepareProxy 方法。

然后访问 `/api/users` 就能访问到 http://jsonplaceholder.typicode.com/users 的数据。

如果要做数据 mock，可以考虑和 [json-server](https://github.com/typicode/json-server) 或者 [mock-server](https://github.com/thoughtbit/mock-server) 结合使用，把 `/api` 代理到 json-server 或者 mock-server 启动的端口。

### externals
```
{
  "externals": {
    "react": "window.React"
  }
}
```
配置 webpack 的 [externals](http://webpack.github.io/docs/configuration.html#externals) 属性。

### library

配置 webpack 的 [library](http://webpack.github.io/docs/configuration.html#output-library) 属性。

### libraryTarget

配置 webpack 的 [libraryTarget](http://webpack.github.io/docs/configuration.html#output-librarytarget) 属性。


### multipage

配置是否多页应用。多页应用会自动提取公共部分为 common.js 和 common.css 。

### dllPlugin
```
"dllPlugin": {
  "name": "bees",
  "include": [
    "react",
    "react-dom",
    "react-redux",
    "react-router",
    "react-router-redux",
    "redux"
  ]
}
```

### define

配置 webpack 的 [DefinePlugin](http://webpack.github.io/docs/list-of-plugins.html#defineplugin) 插件，define 的值会自动做 `JSON.stringify` 处理。

### analyze
在生产环境下开启 Visualizer

```
"env": {
  "production": {
    "analyze": true
  }
}
```

## service workers 

了解 [service workers](https://github.com/goldhand/notes/blob/master/notes/service_workers.md) 相关知识。

开启 service workers

```
"sw": true
```

### env

针对特定的环境进行配置。server 的环境变量是 `development`，build 的环境变量是 `production`。

比如：

```
"env": {
  "development": {
    "cssSourceMap": false
  },
  "production": {
    "cssSourceMap": true
  }
}
```

这样，在 development 下不开启 CSS 的 SourceMap, 在 production 下开启 CSS 的 SourceMap

这样，开发环境下 CSS 的 SourceMap 是 `"cssSourceMap": false`，而生产环境下是 `"cssSourceMap": true`。

## 环境变量

可环境变量临时配置一些参数，包括：

- `PORT`, 端口号，默认 12306
- `HOST`, 默认 localhost
- `HTTPS`，是否开启 https，默认关闭
- `CLEAR_CONSOLE`，设为 none 时清屏

比如，使用 12306 端口开启服务器可以这样：

```bash
// OS X, Linux
$ PORT=12306 bees server

// Windows (cmd.exe)
$ set PORT=12306&&bees server
```

## 命令行参数

### bees init

```bash
Usage:
    bees init <template-name> [project-name]

Options:

    -h, --help   output usage information
    -c, --clone  use git clone

Examples:
    # create a new project with an official template
    $ bees init vue-webpack my-project
  
    # create a new project straight from a github template
    $ bees init username/repo my-project
```


官方模板仓库 [fis-templates organization](https://github.com/fis-templates). 

目前可用的模板列表

- [vue-webpack](https://github.com/fis-templates/vue-webpack) - 使用 Webpack 构建一个 Vue App。
- [vue-gulp](https://github.com/fis-templates/vue-gulp) - 使用 Gulp 构建一个 Vue App。
- [react-webpack](https://github.com/fis-templates/react-webpack) - 使用 Webpack 构建一个 React App。 
- [react-gulp](https://github.com/fis-templates/react-gulp) - 使用 Gulp 构建一个 React App。 
- [angular-rollup](https://github.com/fis-templates/angular-rollup) - 使用 Gulp + Rollup 构建一个 Angular App。 
- [angular-webpack](https://github.com/fis-templates/angular-webpack) - 使用 Webpack 构建一个 Angular App。 
- [angular-gulp](https://github.com/fis-templates/angular-gulp) - 使用 Gulp 构建一个 Angular App。 


### bees server

```bash
$ bees server -h
Usage: bees server [options]

Options:
  --open  Open url in browser after started            [boolean] [default: true]
  -h      Show help                                                    [boolean]
```

### bees build

```bash
$ bees build -h
Usage: bees build [options]

Options:
  --debug            Build without compress           [boolean] [default: false]
  --watch, -w        Watch file changes and rebuild   [boolean] [default: false]
  --output-path, -o  Specify output path                [string] [default: null]
                                                      [boolean] [default: false]
  -h                 Show help                                         [boolean]
```

### bees test

```bash
$ bees test -h
Usage: bees test [options] [mocha-options]

Options:
  --coverage  Output coverage                         [boolean] [default: false]
  -h          Show help                                                [boolean]
```

## 使用 `public` 目录
我们约定 `public` 目录下的文件会在 server 和 build 时被自动 copy 到输出目录（默认是 `./dist`）下。所以可以在这里存放 favicon, iconfont, html, html 里引用的图片等。

## 常见问题

### 那么为什么提供 JSON 级别的约定型配置，而非类似 webpack.config.js 的编码型配置?

首先是 JSON 的方式比较简单，`true`/`false` 或是一些简单的字符串就可完成配置；另外，JSON 方式能有效控制使用场景，而编程式的非常不可控，bees 的一个简单改动都可能导致之前的配置不可用。

### resolve.alias
创建 import 或 require 的别名，来确保模块引入变得更简单, 别名是 `~`, 指向 src/ 文件夹下的常用模块。

```
import NavBar from '~/components/nav-bar'
```

### node-sass 安装失败
```bash
SASS_BINARY_SITE=https://npm.taobao.org/mirrors/node-sass/ npm install node-sass --save-dev
```
### image-webpack-loader 编译问题

libpng issues

Installing on some versions of OSX may raise errors with a missing libpng dependency:
```
Module build failed: Error: dyld: Library not loaded: /usr/local/opt/libpng/lib/libpng16.16.dylib
```

This can be remedied by installing the newest version of libpng with homebrew:

``` bash
brew install libpng
```