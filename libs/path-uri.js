/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-19 13:47
 */


'use strict';


var path = require('path');
var REG_PATH = path.sep === '/' ? /\\/ : /\//g;
var REG_URL = /\\/g;


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

