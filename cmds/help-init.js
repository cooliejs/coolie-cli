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
    console.log('Initial configuration file.');
    console.log('Use the following parameters to initialize the specified type of profile.');
    console.log();
    console.log('1. Usage');
    console.warn('   coolie init <--initType> [options]');
    console.log();
    console.log('2. Example');
    console.warn('   coolie init --coolie-cli');
    console.warn('   coolie init --coolie.js');
    console.log();
    console.log('3. Command');
    debug.success('   init', 'initial configuration file', options);
    console.log();

    console.log('4. Options');
    debug.success('   -d --dirname', 'specified a directory', options);
    debug.success('   -j --coolie.js', 'initial configuration file of `coolie.js`', options);
    debug.success('   -c --coolie-cli', 'initial configuration file of `coolie-cli`', options);
    debug.success('   -h --help', 'show help infomation with command', options);
    console.log();
};



