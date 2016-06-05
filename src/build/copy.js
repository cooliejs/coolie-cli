/**
 * 复制文件
 * @author ydr.me
 * @create 2015-10-28 16:02
 */


'use strict';


var copy = require('../utils/copy.js');
var path = require('ydr-utils').path;
var console = require('blear.node.console');


/**
 * 复制文件
 * @param options {Object} 配置
 * @param options.srcDirname {String} 初始目录
 * @param options.destDirname {String} 初始目录
 * @param options.copy {String} 初始目录
 * @returns {Array}
 */
module.exports = function (options) {
    var copiedList = path.glob(options.copy, {
        srcDirname: options.srcDirname
    });

    copiedList.forEach(function (file) {
        copy(file, {
            srcDirname: options.srcDirname,
            destDirname: options.destDirname,
            copyPath: true,
            version: false,
            minify: true,
            logType: 1
        });
    });

    return copiedList;
};


