# Bee
A simple CLI for serve and build web app, support JSON pattern config.

一个简单的CLI工具，无需复杂的配置，轻松的构建和调试项目。

### 声明

Bee 是 [create-react-app](https://github.com/facebookincubator/create-react-app) 和 [roadhog](https://github.com/sorrycc/roadhog) 的克隆版，根据团队和自己日常开发的需求修改的一个版本。

### 安装

Prerequisites: [Node.js](https://nodejs.org/en/) (>=6.5, 7.x preferred) and [Git](https://git-scm.com/).

``` bash
$ npm install -g bees-cli
```

### 使用

本地开发

```bash
$ bee start
```

打包发布

```bash
$ bee build
```

### 配置

关于配置的一些基本概念：

- 配置存于 `.beerc` 文件中
- 格式为 `JSON`，允许注释
- 布尔类型的配置项默认值均为 `false`

.beerc 默认配置：

```json
{
  "entry": "src/index.js",
  "publicPath": "/",
  "extraBabelPresets": [],
  "extraBabelPlugins": [],
  "disableCSSModules": false,
  "cssSourceMap": false,
  "isGzip": false,
  "gzipExtensions": ["js", "css"],
  "isVisualizer": false,
  "autoprefixer": null,
  "proxy": null,
  "env": null
}
```

.beerc 的 React开发配置：

```json
{
  "entry": "src/index.js",
  "publicPath": "/",
  "extraBabelPresets": [
    "react"
  ],
  "extraBabelPlugins": [
    "transform-runtime"
  ],
  "autoprefixer": null,
  "proxy": null,
  "env": {
    "development": {
      "cssSourceMap": false
    },
    "production": {
      "cssSourceMap": true,
      "isGzip": true,
      "gzipExtensions": ["js", "css"],
      "analyze": true
    }
  }
}
```

### entry

指定 webpack 入口文件，支持 [glob](https://github.com/isaacs/node-glob) 格式。

如果你的项目是多页类型，会希望把 `src/pages` 的文件作为入口。可以这样配：

```
"entry": "src/pages/*.js"
```

### disableCSSModules

禁用 [CSS Modules](https://github.com/css-modules/css-modules)。最好别关，熟悉并使用他后，你会发现写样式简单了很多。

### publicPath

配置生产环境的 [publicPath](http://webpack.github.io/docs/configuration.html#output-publicpath)，开发环境下永远为 `/`。

### extraBabelPlugins

配置额外的 babel plugin。babel plugin 只能添加，不允许覆盖和删除。

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

然后访问 `/api/users` 就能访问到 http://jsonplaceholder.typicode.com/users 的数据。

如果要做数据 mock，可以考虑和 [json-server](https://github.com/typicode/json-server) 或者 [mock-server](https://github.com/thoughtbit/mock-server) 结合使用，把 `/api` 代理到 json-server 或者 mock-server 启动的端口。

### analyze
在生产环境下开启 Visualizer

```
"env": {
  "production": {
    "analyze": true
  }
}
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

- `PORT`, 端口号，默认 8000
- `HOST`, 默认 localhost
- `HTTPS`，是否开启 https，默认关闭

比如，使用 3000 端口开启服务器可以这样：

```bash
// OS X, Linux
$ PORT=3000 bee server

// Windows (cmd.exe)
$ set PORT=3000&&bee server
```

## 命令行参数

### server

```bash
Usage: bee server [options]

Options:
  --open  Open url in browser after started            [boolean] [default: true]
  -h      Show help                                                    [boolean]
```
