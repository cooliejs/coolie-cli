/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-28 00:19
 */


'use strict';

var console = require('blear.node.console');


var REG_START = /^\[\s*?/;
var REG_END = /\s*?]$/;
var REG_QUOTE = /["']/g;


/**
 * 将字符串转为数组
 * @param str
 * @returns {Array}
 */
exports.parse = function (str) {
    str = str.replace(REG_START, '').replace(REG_END, '');

    return str.split(',').map(function (item) {
        return item.replace(REG_QUOTE, '').trim();
    });
};


/**
 * 数组转为字符串
 * @param arr {Array} 数组
 * @returns {string}
 */
exports.stringify = function (arr) {
    var strList = arr.map(function (item) {
        return '"' + item + '"';
    });

    return '[' + strList.join(',') + ']';
};


