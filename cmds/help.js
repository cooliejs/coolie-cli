/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-31 20:33
 */


'use strict';

var fs = require('fs');
var debug = require('ydr-utils').debug;
var path = require('ydr-utils').path;

var banner = require('./banner.js');

var bannerPath = path.join(__dirname, '../data/banner.txt');
var bannerText = fs.readFileSync(bannerPath, 'utf8');


module.exports = function () {
    var options = {
        eventAlign: 'left',
        eventLength: 25
    };

    console.log(bannerText);
    banner();
    console.log();
    console.log('1. Command');
    debug.success('   build', 'build a front-end project', options);
    debug.success('   book', 'open coolie book in default browser', options);
    debug.success('   install <module>', 'install a coolie module', options);
    debug.success('   init', 'initial configuration file', options);
    debug.success('   create', 'create a project template', options);
    debug.success('   help', 'show help information', options);
    debug.success('   version', 'show version information', options);
    console.log();

    console.log('2. Options');
    debug.success('   -d --dirname', 'specified a directory', options);
    debug.success('   -j --coolie.js', 'initial configuration file of `coolie.js`', options);
    debug.success('   -c --coolie-cli', 'initial configuration file of `coolie-cli`', options);
    debug.success('   -e --express', 'choose express template', options);
    debug.success('   -s --static', 'choose static template', options);
    debug.success('   -h --help', 'show help infomation with command', options);
    console.log();
};


