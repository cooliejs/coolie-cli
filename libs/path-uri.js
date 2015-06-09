/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-19 13:47
 */


'use strict';


var path = require('path');
var REG_PATH = path.sep === '/' ? /\\/ : /\//g;
var REG_URL = /\\/g;
var REG_ABSOLUTE = /^((http|ftp)s?|\/\/)/i;
var REG_RELATIVE_ROOT = /^\//;

/**
 * 修正 path 路径为系统分隔符
 * @param p
 * @returns {String}
 */
exports.toSystemPath = function (p) {
    return p.replace(REG_PATH, path.sep);
};


/**
 * 转换路径为 URL 格式
 * @param p
 * @returns {string}
 */
exports.toURIPath = function (p) {
    return String(p).replace(REG_URL, '/');
};


/**
 * 是否为相对路径
 * @param p
 * @returns {boolean}
 */
exports.isRelatived = function (p) {
    return !REG_ABSOLUTE.test(p);
};


/**
 * 是否为相对于当前文件
 * @param p
 * @returns {boolean}
 */
exports.isRelativeFile = function (p) {
    return !REG_ABSOLUTE.test(p) && !REG_RELATIVE_ROOT.test(p);
};


/**
 * 是否为相对于根目录
 * @param p
 * @returns {boolean}
 */
exports.isRelativeRoot = function (p) {
    return !REG_ABSOLUTE.test(p) && REG_RELATIVE_ROOT.test(p);
};


/**
 * 判断路径后缀是否为图片
 * @param extname
 * @returns {boolean}
 */
exports.isImage = function (extname) {
    extname = extname.toLowerCase();

    return ['.png', '.gif', '.jpg', '.jpeg'].indexOf(extname) > -1;
};

