/**
 * build 帮助
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
    console.log('在线指南：<https://coolie.ydr.me/guide/coolie.config.js/>。');
    console.log();
    console.log(console.styles.pretty('[warning] 2.x 及以上版本只支持 CommonJS 规范的模块构建\n' +
        '虽然在一定程度上兼容了 AMD 规范，但不推荐这么做', ['red', 'bold']));
    console.log();
    console.log('1. Usage');
    console.log(console.styles.pretty('   coolie build [options]', 'yellow'));
    console.log();
    console.log('2. Example');
    console.log(console.styles.pretty('   coolie build', 'yellow'));
    console.log();
    console.log('3. Command');
    debug.success('   build', '前端工程化构建', options);
    console.log();

    console.log('4. Options');
    debug.success('   -d --dirname', '指定目标目录，默认为当前工作目录', options);
    debug.success('   -C --config', '指定配置文件，默认为 coolie.config.js', options);
    debug.success('   -h --help', '打印帮助信息', options);
    console.log();
};



