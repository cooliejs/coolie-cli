# coolie.cli
[![coolie](https://img.shields.io/npm/v/coolie.svg?style=flat)](https://www.npmjs.org/package/coolie)

__The front-end development builder.__

__前端开发构建工具。__


- coolie book <http://coolie.ydr.me/>
- 社区 <http://FrontEndDev.org/>


# 功能
- JS 文件的分析、合并、压缩、版本管理
- CSS 文件的分析、合并、压缩、版本管理
- HTML 文件分析、压缩、版本管理
- 入口模块的分析、分块构建、增量构建、合并、压缩、版本管理
- 静态资源的分析、压缩、版本管理



`coolie`是一个全局模块，因此需要全局安装。
```
npm install -g coolie
```


# CMDS
## `coolie`
输出命令帮助信息。


## `coolie book`
打开 coolie book 页面。


## `coolie version`
输出本地版本号和线上最新版本号，方便更新。


## `coolie pull [path]`
下载`coolie.min.js`到指定目录。


## `coolie config [path]`
在指定目录（默认为当前工作目录）生成`coolie-config.js`，即`coolie.js`模块加载的配置文件。


## `coolie json [path]`
在指定目录（默认为当前工作目录）生成`coolie.json`，即`coolie`构建工具的配置文件。


## `coolie build [path]`
在指定目录（默认为当前工作目录），根据`coolie.json`配置来执行构建操作。


# Version
[版本日志](./version.md)
