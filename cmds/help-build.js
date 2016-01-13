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
    console.log();
    console.log('1. Command');
    debug.success('   build', 'build a front-end project', options);
    console.log();

    console.log('2. Options');
    debug.success('   -d --dirname', 'specified a directory', options);
    debug.success('   -h --help', 'show help infomation with command', options);
    console.log();
};



