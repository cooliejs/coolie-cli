/**
 * init 帮助
 * @author ydr.me
 * @create 2016-01-13 17:49
 */


'use strict';

var debug = require('blear.node.debug');
var console = require('blear.node.console');


var banner = require('./banner.js');


module.exports = function () {
    var options = {
        align: 'left'
    };

    banner();
    console.log();
    console.log('1. Usage');
    console.warn('   coolie init <--initType> [options]');
    console.log();
    console.log('2. Example');
    console.warn('   coolie init --coolie-cli');
    console.warn('   coolie init --coolie.js');
    console.log();
    console.log('3. Command');
    debug.success('   init', '初始化配置文件', options);
    console.log();

    console.log('4. Options');
    debug.success('   -d --dirname', '指定目标目录，默认为当前工作目录', options);
    debug.success('   -j --coolie.js', '初始化模块加载器配置文件，生成文件名为`coolie-config.js`', options);
    debug.success('   -c --coolie-cli', '初始化前端工程化构建配置文件，生成文件名为`coolie.config.js`', options);
    debug.success('   -h --help', '打印命名的帮助信息', options);
    console.log();
};



