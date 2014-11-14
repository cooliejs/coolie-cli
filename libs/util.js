/*!
 * util.js
 * @author ydr.me
 * @create 2014-10-23 21:10
 */


"use strict";


var fs = require("fs");
var path = require('path');
var REG_FIX = /[.*+?^=!:${}()|[\]/\\]/g;
var REG_PATH = path.sep === '/' ? /\\/ : /\//g;
var REG_URL = /\\/g;


/**
 * 简单合并两个对象
 * @param a
 * @param b
 * @returns {*|{}}
 */
module.exports.extend = function (a, b) {
    a = a || {};
    b = b || {};

    for (var i in b) {
        if (b.hasOwnProperty(i)) {
            a[i] = b[i];
        }
    }

    return b;
};


/**
 * 判断路径是否为目录
 * @param _path
 * @returns {Boolean}
 */
module.exports.isDirectory = function (_path) {
    var stat;

    try {
        stat = fs.statSync(_path);
    } catch (err) {
        return !1;
    }

    return stat.isDirectory();
};

/**
 * 判断路径是否为目录
 * @param _path
 * @returns {Boolean}
 */
module.exports.isFile = function (_path) {
    var stat;

    try {
        stat = fs.statSync(_path);
    } catch (err) {
        return !1;
    }

    return stat.isFile();
};


/**
 * 修复正则字符串
 * @param str
 * @returns {string}
 */
module.exports.fixRegExp = function (str) {
    return String(str).replace(REG_FIX, "\\$&");
};


/**
 * 转换路径为 URL 格式
 * @param p
 * @returns {string}
 */
module.exports.toURLPath = function (p) {
    return String(p).replace(REG_URL, '/');
};


/**
 * 随机数字
 * @param min
 * @param max
 * @returns {number}
 */
module.exports.randomNumber = function (min, max) {
    return Math.floor(Math.random() * max + min);
};


/**
 * 生成指定长度的随机字符，包含小写字母和数字
 * @param length
 * @returns {string}
 */
module.exports.randomString = function (length) {
    length = length || 6;

    var str = '';

    while (length--) {
        str += this.randomNumber(0, 35).toString(36);
    }

    return str;
};

/**
 * 计算字符字节长度
 * @param string
 * @param [length=2] 双字节长度，默认2
 * @returns {number}
 */
module.exports.bytes = function (string, length) {
    var i = 0,
        j = string.length,
        k = 0,
        c;

    length = length || 2;

    for (; i < j; i++) {
        c = string.charCodeAt(i);
        k += (c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f) ? 1 : length;
    }

    return k;
};


/**
 * 修正 path 路径为系统分隔符
 * @param pt
 * @returns {String}
 */
module.exports.fixPath = function (pt) {
    return pt.replace(REG_PATH, path.sep);
};


/**
 * 判断数据类型，结果全部为小写<br>
 * 原始数据类型：boolean、number、string、undefined、symbol
 * @param {*} object 任何对象
 * @returns {string}
 *
 * @example
 * data.type();
 * // => "undefined"
 *
 * data.type(null);
 * // => "null"
 *
 * data.type(1);
 * // => "number"
 *
 * data.type("1");
 * // => "string"
 *
 * data.type(!1);
 * // => "boolean"
 *
 * data.type({});
 * // => "object"
 *
 * data.type([]);
 * // => "array"
 *
 * data.type(/./);
 * // => "regexp"
 *
 * data.type(window);
 * // => "window"
 *
 * data.type(document);
 * // => "document"
 *
 * data.type(document);
 * // => "document"
 *
 * data.type(NaN);
 * // => "nan"
 *
 * data.type(Infinity);
 * // => "number"
 *
 * data.type(function(){});
 * // => "function"
 *
 * data.type(new Image);
 * // => "element"
 *
 * data.type(new Date);
 * // => "date"
 *
 * data.type(document.links);
 * // => "htmlcollection"
 *
 * data.type(document.body.dataset);
 * // => "domstringmap"
 *
 * data.type(document.body.classList);
 * // => "domtokenlist"
 *
 * data.type(document.body.childNodes);
 * // => "nodelist"
 *
 * data.type(document.createAttribute('abc'));
 * // => "attr"
 *
 * data.type(document.createComment('abc'));
 * // => "comment"
 *
 * data.type(new Event('abc'));
 * // => "event"
 *
 * data.type(document.createExpression());
 * // => "xpathexpression"
 *
 * data.type(document.createRange());
 * // => "range"
 *
 * data.type(document.createTextNode(''));
 * // => "text"
 */
module.exports.type = function (object) {
    if (typeof window !== 'undefined' && object === window) {
        return 'window';
    } else if (typeof global !== 'undefined' && object === global) {
        return 'global';
    } else if (typeof document !== 'undefined' && object === document) {
        return 'document';
    } else if (object === undefined) {
        return 'undefined';
    } else if (object === null) {
        return 'null';
    }

    var ret = Object.prototype.toString.call(object).match(/\s(.*)\]/)[1].toLowerCase();

    if (/element/.test(ret)) {
        return 'element';
    } else if (isNaN(object) && ret === 'number') {
        return 'nan';
    }

    return ret;
};
