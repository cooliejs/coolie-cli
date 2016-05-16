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
    console.log();
    console.table([
        ['coolie-cli'],
        ['coolie@' + pkg.version],
        [pkg.description],
        [pkg.homepage]
    ], {
        colors: ['green'],
        padding: 10
    });

    console.log();
};
