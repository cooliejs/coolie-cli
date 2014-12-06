# Coolie 苦力 [![coolie](https://img.shields.io/npm/v/coolie.svg?style=flat)](https://www.npmjs.org/package/coolie)

A builder for front-end developments.

# 功能
- js 模块的合并、压缩、依赖分析、构建，【[coolie 模块加载器](https://github.com/cloudcome/coolie)】；
- css 模块的合并、压缩、构建；
- html 样式依赖分析、压缩、构建。

# 特点
- js 模块合并、模块路径压缩、模块合并、版本号更新；
- css 模块合并、版本号更新；
- html 模板压缩、link合并。


`coolie`是一个全局模块，因此需要全局安装。
```
npm install -g coolie
```


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
![coolie](http://ydrimg.oss-cn-hangzhou.aliyuncs.com/20141116220221094451640234.jpg)



# Version
- 0.4.0
	- 支持绝对路径
	- 完善css配置
- 0.3.1
	- 适配了[coolie.js@0.3.0](https://github.com/cloudcome/coolie)
	- 支持依赖省略
	- 生成模块依赖MAP
- 0.2.1
	- 适配了[coolie.js@0.2.0](https://github.com/cloudcome/coolie)
	- 生成完整的模块版本MAP
- 0.1.8
	- 修正 css 引用构建顺序
	- 优化了 css 文件重复引用
	- 支持 html 文件的构建
	- 支持 css 引用的合并替换
	- 新增命令打开帮助页面
- 0.0.17
	- 优化构建配置
	- build 的时候支持压缩 css、html 模块
	- 入口模块简化为0
	- 一个模块占用一行
