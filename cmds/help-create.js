/**
 * create 帮助
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
    console.log('Create a front-end engineering template.');
    console.log('Use the following parameters to specify the type of template.');
    console.log();
    console.log('Usage');
    console.log('    coolie create <--templateType> [options]');
    console.log();
    console.log('1. Command');
    debug.success('   create', 'create a sample, default is express', options);
    console.log();

    console.log('2. Options');
    debug.success('   -e --express', 'create a express sample', options);
    debug.success('   -s --static', 'create a static sample', options);
    debug.success('   --mongoose', 'express with mongoose', options);
    debug.success('   --redis', 'express with redis', options);
    debug.success('   -d --dirname', 'specified a directory', options);
    debug.success('   -h --help', 'show help infomation with command', options);
    console.log();
};



