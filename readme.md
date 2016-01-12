# coolie-cli

[![Build Status][travis-img]][travis-url] 
[![coolie][shields-img]][shields-url]

[travis-img]: https://travis-ci.org/cooliejs/coolie-cli.svg?branch=master
[travis-url]: https://travis-ci.org/cooliejs/coolie-cli
[shields-img]: https://img.shields.io/npm/v/coolie.svg
[shields-url]: https://www.npmjs.com/package/coolie

__The front-end development builder.__

__前端开发构建工具。__配合[coolie.js](https://github.com/cooliejs/coolie.js)（模块加载器）完成前端工程化构建。


- coolie 官方指南 <http://coolie.ydr.me/>
- 社区 <http://FrontEndDev.org/>


# 功能
- JS 文件的分析、合并、压缩、版本管理
- CSS 文件的分析、合并、压缩、版本管理
- HTML 文件分析、压缩、版本管理
- 入口模块的分析、分块构建、异步模块构建、增量构建、合并、压缩、版本管理
- 静态资源的分析、压缩、版本管理


`coolie`是一个全局模块，因此需要全局安装。

```
npm install -g coolie
```


# 使用方法
```

                               oooo   o8o
                               `888   `"'
  .ooooo.   .ooooo.   .ooooo.   888  oooo   .ooooo.
 d88' `"Y8 d88' `88b d88' `88b  888  `888  d88' `88b
 888       888   888 888   888  888   888  888ooo888
 888   .o8 888   888 888   888  888   888  888    .o
 `Y8bod8P' `Y8bod8P' `Y8bod8P' o888o o888o `Y8bod8P'

╔═══════════════════════════════════════════════════╗
║   coolie@1.0.0                                    ║
║   The front-end development builder.              ║
╚═══════════════════════════════════════════════════╝

1. Command
   build                  >> build a front-end project
   book                   >> open coolie book in default browser
   install <module>       >> install a coolie module
   init                   >> initial configuration file
   help                   >> show help information
   version                >> show version information

2. Options
   -d --dirname           >> specified a directory
   -j --coolie.js         >> initial configuration file of `coolie.js`
   -c --coolie-cli        >> initial configuration file of `coolie-cli`
   
```
