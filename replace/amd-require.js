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
var parseDefineRequireVarible = require('../parse/define-require-varible.js');

var REG_DEFINE = /^\bdefine\b\s*?\b\(\s*?function\b[^(]*\(([^,)]*)/;


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
    var depLength = Object.keys(depName2IdMap).length;
    var requireVar = parseDefineRequireVarible(file, {
        code: code
    });

    if (!requireVar && depLength) {
        debug.error('replace require', path.toSystem(file));
        debug.error('replace require', 'can not found `require` variable, but used');
        debug.error('replace require', 'code must be compressed, before replace amd define');
        return process.exit(1);
    }

    dato.each(depName2IdMap, function (depName, depId) {
        var reg = _buildReg(requireVar, depName, options.async);

        code = options.async ?
            code.replace(reg, requireVar + '.async("' + depId + '"') :
            code.replace(reg, requireVar + '("' + depId + '")');
    });

    return code;
};


/**
 * 生成正则
 * @param requireVar
 * @param dep
 * @param async
 * @returns {RegExp}
 * @private
 */
function _buildReg(requireVar, dep, async) {
    dep = string.escapeRegExp(dep);

    if (async) {
        // require.async("..."
        return new RegExp('\\b' + string.escapeRegExp(requireVar) + '\\.async\\([\'"]' + dep + '[\'"]', 'g');
    }

    // require("...");
    // require("...", "...");
    return new RegExp(string.escapeRegExp(requireVar) + '\\(([\'"])' + dep + '(\\1)\\)', 'g');
}



