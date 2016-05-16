/**
 * demo 帮助
 * @author ydr.me
 * @create 2016-01-13 17:49
 */


'use strict';

var debug = require('ydr-utils').debug;
var log = require('ydr-utils').log;

var banner = require('./banner.js');


module.exports = function () {
    var options = {
        nameAlign: 'left'
    };

    banner();
    console.log();
    console.log('1. Usage');
    console.warn('   coolie demo <demoId> [options]');
    console.log();
    console.log('2. Example');
    console.warn('   coolie demo 1');
    console.log();
    console.log('3. Command');
    debug.success('   demo', '下载 coolie 官方示例', options);
    console.log();

    console.log('4. Options');
    debug.success('   -d --dirname', '指定目标目录，默认为当前工作目录', options);
    debug.success('   -h --help', '打印命名的帮助信息', options);
    console.log();
};



