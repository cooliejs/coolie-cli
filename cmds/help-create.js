/**
 * create 帮助
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
    console.log('Create a Front-end engineering template.');
    console.log('Use the following parameters to specify the type of template.');
    console.log();
    console.log('1. Usage');
    console.log(log.yellow('   coolie create <--templateType> [options]'));
    console.log();
    console.log('2. Example');
    console.log(log.yellow('   coolie create --express'));
    console.log(log.yellow('   coolie create --static'));
    console.log();
    console.log('3. Command');
    debug.success('   create', 'create a project template', options);
    console.log();

    console.log('4. Options');
    debug.success('   -e --express', 'create a express project template', options);
    debug.success('   -s --static', 'create a static project template', options);
    debug.success('   -m --mongoose', 'express project template with mongoose', options);
    debug.success('   -r --redis', 'express project template with redis', options);
    debug.success('   -d --dirname', 'specified a directory', options);
    debug.success('   -h --help', 'show help infomation with command', options);
    console.log();
};



