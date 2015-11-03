/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-31 20:33
 */


'use strict';

var debug = require('ydr-utils').debug;

var banner = require('./banner.js');

module.exports = function () {
    var options = {
        eventAlign: 'left'
    };

    banner();
    console.log('1. Command');
    debug.success('   build', 'build a front-end project', options);
    debug.success('   book', 'open coolie book in default browser', options);
    debug.success('   install <name>', 'install a coolie module', options);
    debug.success('   init', 'initialize `coolie.js` or `coolie cli` config file', options);
    //debug.success('   create', 'create a sample, default is node', options);
    debug.success('   help', 'show help info', options);
    debug.success('   version', 'show version info', options);
    console.log();
    console.log('2. Options');
    debug.success('   -d --dirname', 'specified a directory', options);
    debug.success('   -j --coolie.js', 'initialize `coolie.js` config file', options);
    debug.success('   -c --"coolie cli"', 'initialize `coolie cli` config file', options);
    //debug.success('   -n --node', 'create a node sample', options);
    //debug.success('   -s --static', 'create a static sample', options);
    console.log();
};


