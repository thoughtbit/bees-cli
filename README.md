# Bee
A simple CLI for serve and build web app, support JSON pattern config.

一个简单的CLI工具，无需复杂的配置，轻松的构建和调试项目。

### 声明

Bee 是 [create-react-app](https://github.com/facebookincubator/create-react-app) 的克隆版。

### 安装

Prerequisites: [Node.js](https://nodejs.org/en/) (>=6.2, 7.x preferred) and [Git](https://git-scm.com/).

``` bash
$ npm install -g bee
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

默认配置：

```json
{
  "entry": "src/index.js",
  "disableCSSModules": false,
  "less": false,
  "publicPath": "/",
  "extraBabelPlugins": [],
  "autoprefixer": null,
  "proxy": null,
  "env": null
}
```
