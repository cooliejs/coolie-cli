/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-31 20:35
 */



'use strict';

var pkg = require('../package.json');

module.exports = function () {
    console.log();
    console.table([
        ['coolie@' + pkg.version],
        [pkg.description],
        ['官网：'+pkg.homepage]
    ], {
        colors: ['green'],
        padding: 1
    });

    console.log();
};
