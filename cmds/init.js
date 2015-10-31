/**
 * 初始化
 * @author ydr.me
 * @create 2015-10-31 14:11
 */


'use strict';

var path = require('path');

var copy = require('../utils/copy.js');

var coolieConfigJSPath = path.join(__dirname, '../data/coolie.config.js');

/**
 * 生成配置文件
 * @param options {Object} 配置
 * @param options.srcDirname {String} 根目录
 */
module.exports = function (options) {
    copy(coolieConfigJSPath, {
        srcDirname: options.srcDirname,
        destDirname: options.srcDirname,
        copyPath: false,
        version: false,
        logType: 2
    });
};

