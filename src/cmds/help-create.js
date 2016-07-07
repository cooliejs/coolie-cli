/**
 * create 帮助
 * @author ydr.me
 * @create 2016-01-13 17:49
 */


'use strict';

var debug = require('blear.node.debug');
var console = require('blear.node.console');


var banner = require('./banner.js');


module.exports = function () {
    var options = {
        nameAlign: 'left'
    };

    banner();
    console.log();
    console.log('1. Usage');
    console.warn('   coolie create <--templateType> [options]');
    console.log();
    console.log('2. Example');
    console.warn('   coolie create --express');
    console.warn('   coolie create --static');
    console.log();
    console.log('3. Command');
    debug.success('   create', '创建一个前端样板工程', options);
    console.log();

    console.log('4. Options');
    debug.success('   -d --dirname', '指定目标目录，默认为当前工作目录', options);
    debug.success('   -e --express', '选择 express 全栈工程样板', options);
    debug.success('   -s --static', '选择静态工程样板', options);
    debug.success('   -r --redis', '是否在 express 样板中使用 redis', options);
    debug.success('   -m --mongoose', '是否在 express 样板中使用 mongoose', options);
    debug.success('   -h --help', '打印命名的帮助信息', options);
    console.log();
};



