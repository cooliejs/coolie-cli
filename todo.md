1、模块里的 css 引用图片 √
2、模块自由拆分 √
3、独立脚本的合并压缩 √
4、引用图片的压缩 
5、configs.\_srcPath => \_srcDir
6、内联样式的 url 替换 √
7、模块构建性能优化，同一个模块分析之后缓存下来
8、模块内的静态资源，按照文件大小转移到 res 目录下 √
9、更合理的错误提示
10、更合理的接口化，配置改成 js 文件 √
11、支持文件流 require('./style.css', 'css|url'); √
12、单页面应用的前端构建，资源增量加载，页面模块和页面单一依赖的模块抽离 √

13、img data-original 脱离
14、html include 功能
15、命令名称规范化
16、coolie module hot replacement
17、version 只保存 async、chunk 模块，入口模块已写在 data-main 里
