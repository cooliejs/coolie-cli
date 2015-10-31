/**
 * install
 * @author ydr.me
 * @create 2015-10-31 14:54
 */


'use strict';

var debug = require('ydr-utils').debug;

var pkg = require('../package.json');
var downZip = require('../utils/down-zip.js');

/**
 * 下载
 * @param options {Object} 配置
 * @param options.name {String} 名称
 * @param options.destDirname {String} 目标目录
 */
module.exports = function (options) {
    var url = pkg.coolie[options.name];

    if (!url) {
        debug.error('coolie install', 'can not found ' + options.name);
        return process.exit(1);
    }

    downZip({
        url: url,
        destDirname: options.destDirname,
        name: options.name
    });
};

