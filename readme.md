# Coolie 苦力

A JavaScript module builder for coolie.

服务于[coolie](https://github.com/cloudcome/coolie)的脚本模块化打包工具。

`coolie`是一个全局模块，因此需要全局安装。
```
npm instal -g coolie
```


# API
## `coolie version`
输出本地版本号和线上最新版本号，方便更新。

## `coolie config [path]`
在指定目录（默认为当前工作目录）生成`coolie-config.js`，即`coolie.js`模块加载的配置文件。

## `coolie json [path]`
在指定目录（默认为当前工作目录）生成`coolie.json`，即`coolie`构建工具的配置文件。

## `coolie build [path]`
在指定目录（默认为当前工作目录），根据`coolie.json`配置来执行构建操作。


