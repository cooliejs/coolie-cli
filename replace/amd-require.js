/**
 * replace amd require
 * @author ydr.me
 * @create 2015-10-24 13:08
 */


'use strict';

var string = require('ydr-utils').string;
var dato = require('ydr-utils').dato;
var debug = require('ydr-utils').debug;

var pathURI = require('../utils/path-uri.js');

var REG_DEFINE = /^\bdefine\b\s*?\b\(\s*?function\b[^(]*\(([^,)]*)/;


/**
 * 替换 require
 * @param file {String} 文件路径
 * @param options {Object} 配置
 * @param options.code {String} 代码，压缩后的代码
 * @param options.depName2IdMap {Object} 依赖对应表 [{name: id}]
 */
module.exports = function (file, options) {
    var code = options.code;
    var depName2IdMap = options.depName2IdMap;
    var depLength = Object.keys(depName2IdMap).length;
    var requireVar = _getRequireVar(code);

    if (!requireVar && depLength) {
        debug.error('replace require', 'can not found `require` variable, but used');
        debug.error('replace require', 'code must be compressed, before replace amd define');
        return process.exit(1);
    }

    dato.each(depName2IdMap, function (depName, depId) {
        var reg = _buildReg(requireVar, depName);

        code = code.replace(reg, requireVar + '("' + depId + '")');
    });

    return code;
};


/**
 * 提取 define 里的 require 变量
 * define("index.js",["1"],function(s,e,i){"use strict";s("../libs/all.js");console.log("app/index.js")});
 * @private
 */
function _getRequireVar(str) {
    return (str.match(REG_DEFINE) || ['', ''])[1].trim();
}


/**
 * 生成正则
 * @param requireVar
 * @param dep
 * @returns {RegExp}
 * @private
 */
function _buildReg(requireVar, dep) {
    dep = string.escapeRegExp(dep);

    // require("...");
    // require("...", "...");
    return new RegExp(string.escapeRegExp(requireVar) + '\\([\'"]' + dep + '[\'"]' +
        '(?:\\s*?,\\s*?[\'][^\'"]*?[\'"])?\\)', 'g');
}



