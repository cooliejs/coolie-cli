/**
 * help
 * @author ydr.me
 * @create 2015-10-31 20:33
 */


'use strict';

var fs = require('fs');
var debug = require('blear.node.debug');
var console = require('blear.node.console');


var banner = require('./banner.js');

module.exports = function () {
    var options = {
        align: 'left'
    };
    
    banner();
    console.log();
    console.log('1. Commands');
    debug.normal('   build', '前端工程化构建', options);
    debug.normal('   book', '打开 coolie 官方指南', options);
    // debug.normal('   install <module>', 'install a coolie module', options);
    debug.normal('   init', '初始化配置文件', options);
    debug.normal('   create', '创建一个 coolie 工程脚手架', options);
    debug.normal('   demo <demoId>', '阅读 coolie 官方示例', options);
    debug.normal('   help', '打印帮助信息', options);
    debug.normal('   version', '打印版本信息', options);
    console.log();

    console.log('2. Options');
    debug.normal('   -h --help', '打印命令的帮助信息', options);
    // debug.normal('   -d --dirname', '指定目标目录，默认为当前工作目录', options);
    // debug.normal('   -j --coolie.js', '初始化模块加载器配置文件，生成文件名为`coolie-config.js', options);
    // debug.normal('   -c --coolie-cli', '初始化前端工程化构建配置文件，生成文件名为`coolie.config.js', options);
    // debug.normal('   -C --configFile', '指定构建时使用的配置文件，默认为`coolie.config.js`', options);
    // debug.normal('   -e --express', '选择 express 全栈工程脚手架', options);
    // debug.normal('   -s --static', '选择静态工程脚手架', options);
    // debug.normal('   -r --redis', '是否在 express 工程脚手架中使用 redis', options);
    // debug.normal('   -m --mongoose', '是否在 express 工程脚手架中使用 mongoose', options);
    console.log();
};


