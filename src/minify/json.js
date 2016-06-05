/**
 * json minify
 * @author ydr.me
 * @create 2015-10-22 17:34
 */


'use strict';

var path = require('ydr-utils').path;
var debug = require('blear.node.debug');
var console = require('blear.node.console');


/**
 * 压缩 JSON string
 * @param file {String} 文件
 * @param options {Object} 配置
 * @param options.code {String} 代码
 */
module.exports = function (file, options) {
    var json = {};
    var code = options.code;

    try {
        json = JSON.parse(code);
    } catch (err) {
        debug.error('jsonminify', path.toSystem(file));
        debug.error('jsonminify', err.message);
        process.exit(1);
    }

    return JSON.stringify(json);
};




