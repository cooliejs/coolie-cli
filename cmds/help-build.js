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
    console.log('Build a front-end project, use `-d` parameter specifies the root directory.');
    console.log('Use `cookie init -c` to initialize a build configuration file.');
    console.log('Online guide: https://coolie.ydr.me/guide/coolie.config.js/');
    console.log();
    console.log('Usage');
    console.log('    coolie build [args]');
    console.log();
    console.log('1. Command');
    debug.success('   build', 'build a front-end project', options);
    console.log();

    console.log('2. Options');
    debug.success('   -d --dirname', 'specified a directory', options);
    debug.success('   -h --help', 'show help infomation with command', options);
    console.log();
};



