/**
 * build 帮助
 * @author ydr.me
 * @create 2016-01-13 17:49
 */


'use strict';

var debug = require('ydr-utils').debug;

var banner = require('./banner.js');


module.exports = function () {
    var options = {
        eventAlign: 'left',
        eventLength: 25
    };

    banner();
    console.log('构建前端工程，使用 `-d` 参数指定构建根目录。');
    console.log('在执行构建之前，你需要使用 `coolie init -c` 初始化一个构建配置文件。');
    console.log('构建指导：https://coolie.ydr.me/guide/coolie.config.js/');
    console.log();
    console.log('1. Command');
    debug.success('   build', 'build a front-end project', options);
    console.log();

    console.log('2. Options');
    debug.success('   -d --dirname', 'specified a directory', options);
    debug.success('   -h --help', 'show help infomation with command', options);
    console.log();
};



