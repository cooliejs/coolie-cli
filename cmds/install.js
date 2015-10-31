/**
 * install
 * @author ydr.me
 * @create 2015-10-31 14:54
 */


'use strict';

var debug = require('ydr-utils').debug;
var request = require('ydr-utils').request;

var pkg = require('../package.json');
var installZip = require('../utils/install-zip.js');
var installFile = require('../utils/install-file.js');

/**
 * 下载
 * @param options {Object} 配置
 * @param options.name {String} 名称
 * @param options.destDirname {String} 目标目录
 */
module.exports = function (options) {
    var module = pkg.coolie.modules[options.name];

    if (!module) {
        debug.error('coolie install', 'can not found ' + options.name);
        return process.exit(1);
    }

    if (module.type === 'file') {
        installFile({
            url: module.url,
            destDirname: options.destDirname
        });
    } else {
        installZip({
            url: module.url,
            destDirname: options.destDirname,
            name: options.name
        });
    }
};
