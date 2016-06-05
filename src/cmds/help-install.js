/**
 * init 帮助
 * @author ydr.me
 * @create 2016-01-13 17:49
 */


'use strict';

var debug = require('blear.node.debug');
var log = require('ydr-utils').log;
var console = require('blear.node.console');


var banner = require('./banner.js');


module.exports = function () {
    debug.error('coolie tips', 'coolie 2.x 及以上版本已不支持下载任何模块了\n' +
        '下载 coolie.js 请使用 npm install coolie.js');

    // var options = {
    //     nameAlign: 'left'
    // };
    //
    // banner();
    // console.log('Install supported front-end module.');
    // console.log('Currently supported modules are: ');
    // console.log('coolie.js, alien, donkey');
    // console.log();
    // console.log('1. Usage');
    // console.warn('   coolie install <module> [options]');
    // console.log();
    // console.log('2. Example');
    // console.warn('   coolie install coolie.js');
    // console.warn('   coolie install alien');
    // console.warn('   coolie install donkey');
    // console.log();
    // console.log('3. Command');
    // debug.success('   install <module>', 'install a coolie module', options);
    // console.log();
    //
    // console.log('4. Options');
    // debug.success('   -d --dirname', 'specified a directory', options);
    // debug.success('   -h --help', 'show help infomation with command', options);
    // console.log();
};



