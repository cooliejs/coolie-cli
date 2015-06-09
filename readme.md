# coolie.cli
[![coolie](https://img.shields.io/npm/v/coolie.svg?style=flat)](https://www.npmjs.org/package/coolie)

__The front-end development builder.__

__前端开发构建工具。__


- gitbook <http://coolie.ydr.me/>
- 社区 <http://FrontEndDev.org/>


# 功能
- js 模块的合并、压缩、依赖分析、构建。
- css 模块的合并、压缩、构建、引用分析。
- html 样式依赖分析、压缩、构建，资源地址管理。
- 静态引用资源（图片、字体）版本管理。
- 支持跨站资源发布及构建。
- 生成资源引用关系地图（relationship-map.json）。
- 命令生成`coolie-config.js`。
- 命令生成`coolie.json`。
- 等等。



`coolie`是一个全局模块，因此需要全局安装。
```
npm install -g coolie
```


# API
## `coolie`
输出命令帮助信息。


## `coolie wiki`
打开 coolie wiki 页面。


## `coolie version`
输出本地版本号和线上最新版本号，方便更新。


## `coolie pull [path]`
下载`coolie.min.js`到指定目录。


## `coolie alien [path]`
下载`alien`发布版到指定目录。


## `coolie config [path]`
在指定目录（默认为当前工作目录）生成`coolie-config.js`，即`coolie.js`模块加载的配置文件。


## `coolie json [path]`
在指定目录（默认为当前工作目录）生成`coolie.json`，即`coolie`构建工具的配置文件。


## `coolie build [path]`
在指定目录（默认为当前工作目录），根据`coolie.json`配置来执行构建操作。


# Version
[版本日志](./version.md)
