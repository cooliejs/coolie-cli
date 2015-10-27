/**
 * replace amd require
 * @author ydr.me
 * @create 2015-10-24 13:08
 */


'use strict';

var string = require('ydr-utils').string;
var dato = require('ydr-utils').dato;
var debug = require('ydr-utils').debug;
var path = require('ydr-utils').path;

var pathURI = require('../utils/path-uri.js');


/**
 * 替换 require
 * @param file {String} 文件路径
 * @param options {Object} 配置
 * @param options.code {String} 代码，压缩后的代码
 * @param options.depName2IdMap {Object} 依赖对应表 [{name: id}]
 * @param options.async {Boolean} 是否异步模块
 */
module.exports = function (file, options) {
    var code = options.code;
    var depName2IdMap = options.depName2IdMap;

    dato.each(depName2IdMap, function (depName, depId) {
        var reg = _buildReg(depName, options.async);

        code = options.async ?
            code.replace(reg, 'require.async("' + depId + '"') :
            code.replace(reg, 'require("' + depId + '")');
    });

    return code;
};


/**
 * 生成正则
 * @param dep
 * @param async
 * @returns {RegExp}
 * @private
 */
function _buildReg(dep, async) {
    dep = string.escapeRegExp(dep);

    if (async) {
        // require.async("..."
        return new RegExp('\\brequire\\.async\\([\'"]' + dep + '[\'"]', 'g');
    }

    // require("...");
    // require("...", "...");
    return new RegExp('\\brequire\\(([\'"])' + dep + '(\\1)\\)', 'g');
}



