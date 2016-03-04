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
        eventAlign: 'left',
        eventLength: 25
    };

    banner();
    console.log('Download a coolie demo, use `-d` parameter specifies the root directory.');
    console.log();
    console.log('1. Usage');
    console.warn('   coolie demo <demoId> [options]');
    console.log();
    console.log('2. Example');
    console.warn('   coolie demo 1');
    console.log();
    console.log('3. Command');
    debug.success('   demo', 'download a coolie demo', options);
    console.log();

    console.log('4. Options');
    debug.success('   -d --dirname', 'specified a directory', options);
    debug.success('   -h --help', 'show help infomation with command', options);
    console.log();
};



