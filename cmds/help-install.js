/**
 * init 帮助
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
    console.log('Install supported front-end module.');
    console.log('Currently supported modules are: ');
    console.log('coolie.js, alien, donkey');
    console.log();
    console.log('1. Usage');
    console.warn('   coolie install <module> [options]');
    console.log();
    console.log('2. Example');
    console.warn('   coolie install coolie.js');
    console.warn('   coolie install alien');
    console.warn('   coolie install donkey');
    console.log();
    console.log('3. Command');
    debug.success('   install <module>', 'install a coolie module', options);
    console.log();

    console.log('4. Options');
    debug.success('   -d --dirname', 'specified a directory', options);
    debug.success('   -h --help', 'show help infomation with command', options);
    console.log();
};



