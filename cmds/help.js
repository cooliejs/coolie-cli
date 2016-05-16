/**
 * help
 * @author ydr.me
 * @create 2015-10-31 20:33
 */


'use strict';

var fs = require('fs');
var debug = require('ydr-utils').debug;
var path = require('ydr-utils').path;

var banner = require('./banner.js');

var bannerPath = path.join(__dirname, '../data/banner.txt');
var bannerText = fs.readFileSync(bannerPath, 'utf8');


module.exports = function () {
    var options = {
        nameAlign: 'left'
    };

    console.log(console.styles.pretty(bannerText, 'green'));
    banner();
    console.log();
    console.log('1. 命令');
    debug.success('   build', '前端工程化构建', options);
    debug.success('   book', '打开 coolie 官方指南', options);
    // debug.success('   install <module>', 'install a coolie module', options);
    debug.success('   init', '初始化配置文件', options);
    debug.success('   create', '创建一个 coolie 样板工程', options);
    debug.success('   demo <demoId>', '下载 coolie 官方示例', options);
    debug.success('   help', '打印帮助信息', options);
    debug.success('   version', '打印版本信息', options);
    console.log();

    console.log('2. 参数');
    debug.success('   -h --help', '打印命名的帮助信息', options);
    debug.success('   -d --dirname', '指定目标目录', options);
    debug.success('   -j --coolie.js', '初始化模块加载器配置文件', options);
    debug.success('   -c --coolie-cli', '初始化前端工程化构建配置文件', options);
    debug.success('   -e --express', '选择 express 网站样板', options);
    debug.success('   -s --static', '选择静态网站样板', options);
    debug.success('   -r --redis', '是否在 express 样板中使用 redis', options);
    debug.success('   -m --mongoose', '是否在 express 样板中使用 mongoose', options);
    console.log();
};


