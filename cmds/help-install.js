/**
 * init 帮助
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
    console.log('Install supported front-end module.');
    console.log('Currently supported modules are: ');
    console.log('coolie.js, alien, donkey');
    console.log();
    console.log('Usage');
    console.log('    coolie install <module> [args]');
    console.log();
    console.log('1. Command');
    debug.success('   install <module>', 'install a coolie module', options);
    console.log();

    console.log('2. Options');
    debug.success('   -d --dirname', 'specified a directory', options);
    debug.success('   -h --help', 'show help infomation with command', options);
    console.log();
};



