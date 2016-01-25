/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-31 20:35
 */



'use strict';

var fs = require('fs');
var string = require('ydr-utils').string;
var log = require('ydr-utils').log;

var pkg = require('../package.json');

module.exports = function () {
    var table = log.table([
        ['coolie-cli'],
        ['coolie@' + pkg.version],
        [pkg.description]
    ]);

    table = log.magenta(table);
    table = log.bold(table);

    console.log();
    console.log(table);
};
