# Coolie 苦力

A JavaScript module builder for coolie.

服务于[coolie](https://github.com/cloudcome/coolie)的脚本模块化打包工具。
**[关于 coolie 脚本加载器以及构建工具的完整帮助。](https://github.com/cloudcome/coolie/wiki)**


`coolie`是一个全局模块，因此需要全局安装。
```
npm install -g coolie
```

![see](http://ydrimg.oss-cn-hangzhou.aliyuncs.com/20141028170749360717674649.jpg)


# API
## `coolie`
输出命令帮助信息。


## `coolie help`
打开 coolie wiki 页面。


## `coolie version`
输出本地版本号和线上最新版本号，方便更新。


## `coolie config [path]`
在指定目录（默认为当前工作目录）生成`coolie-config.js`，即`coolie.js`模块加载的配置文件。


## `coolie json [path]`
在指定目录（默认为当前工作目录）生成`coolie.json`，即`coolie`构建工具的配置文件。


## `coolie build [path]`
在指定目录（默认为当前工作目录），根据`coolie.json`配置来执行构建操作。

![coolie build](http://ydrimg.oss-cn-hangzhou.aliyuncs.com/20141114175311946304195012.jpg)



# Version
- 0.1.4
	- 支持 html 文件的构建
	- 支持 css 引用的合并替换
	- 新增命令打开帮助页面
- 0.0.17
	- 优化构建配置
	- build 的时候支持压缩 css、html 模块
	- 入口模块简化为0
	- 一个模块占用一行
