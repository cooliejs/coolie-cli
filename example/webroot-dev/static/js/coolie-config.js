/**
 * ======================================================
 * coolie.js 配置文件 `coolie-config.js`
 * 使用 `coolie init -j` 生成 `coolie-config.js` 文件模板
 * 前端模块加载器配置文件
 *
 * @link http://coolie.ydr.me/guide/coolie-config.js/
 * @author ydr.me
 * @version 2.0.0-alpha
 * @create 2016-05-16 15:33:19
 * ======================================================
 */

coolie.config({
    // 模块模式，开发环境为 COMMONJS
    mode: 'CJS',

    // 入口模块基准路径，相对于当前文件
    mainModulesDir: '/static/js/app/',

    // node_modules 目录指向，相对于 baseDir
    nodeModulesDir: '/node_modules/',

    // 是否为调试模式，构建之后会修改为 false
    debug: true,

    // 全局变量，用于模块构建的预定义变量判断压缩
    global: {
        hehe: true,
        CLASSICAL: false
    }
}).callback(function () {
    console.log(1);
}).callback(function () {
    console.log(2);
}).use();
