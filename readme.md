# Coolie 苦力

A JavaScript module builder for coolie.

服务于[coolie](https://github.com/cloudcome/coolie)的脚本模块化打包工具。

`coolie`是一个全局模块，因此需要全局安装。
```
npm install -g coolie
```


# API
## `coolie`
输出命令帮助信息。

![coolie help](http://ydrimg.oss-cn-hangzhou.aliyuncs.com/20141024181010894251681790.png)

## `coolie version`
输出本地版本号和线上最新版本号，方便更新。

![coolie version](http://ydrimg.oss-cn-hangzhou.aliyuncs.com/20141024180959069426642071.png)

## `coolie config [path]`
在指定目录（默认为当前工作目录）生成`coolie-config.js`，即`coolie.js`模块加载的配置文件。

![coolie config](http://ydrimg.oss-cn-hangzhou.aliyuncs.com/20141024180943985343936750.png)

## `coolie json [path]`
在指定目录（默认为当前工作目录）生成`coolie.json`，即`coolie`构建工具的配置文件。

![coolie json](http://ydrimg.oss-cn-hangzhou.aliyuncs.com/20141027100536566924235390.png)

## `coolie build [path]`
在指定目录（默认为当前工作目录），根据`coolie.json`配置来执行构建操作。

![coolie build](http://ydrimg.oss-cn-hangzhou.aliyuncs.com/20141024181025427785800803.png)


