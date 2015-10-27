# 构建脚本

分析出所有入口文件
=>
分析所有`require.async`
=>
遍历构建
=>
如果符合 chunk，则独立出来，标记 main 依赖了哪些 chunk，chunk 计数
替换`require.async`/`require`/`define`
将 module code 缓存到 cache 里
=>
全部构建完成
=>
依次生成 main 代码 + 追加 chunk 数组
=>
生成 main 文件
