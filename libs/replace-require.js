/*!
 * 替换 require 字符串
 * @author ydr.me
 * @create 2014-10-23 20:50
 */


"use strict";

var util = require("./util.js");
var log = require("./log.js");
var REG_DEFINE = /^define\(.*?function\(([^,)]*).*?\)/;


/**
 * 替换 require
 * @param code 代码必须先进行压缩过后的，保证没有其他注释干扰
 * @param deps 依赖数组
 * @param depsMap 依赖对应表
 */
module.exports = function (code, relDeps, relDepsMap) {
    var requireVar = _getRequireVar(code);

    if (!requireVar) {
        return code;
    }

    relDeps.forEach(function (dep) {
        var reg = _buildReg(requireVar, dep);
        var id = relDepsMap[dep];

        if (!id) {
            log("replace require", "can not found `" + dep + "` map", "error");
            process.exit();
        }

        code = code.replace(reg, requireVar + "(\"" + relDepsMap[dep] + "\")");
    });

    return code;
};


/**
 * 提取 define 里的 require 变量
 * define("index.js",["1"],function(s,e,i){"use strict";s("../libs/all.js");console.log("app/index.js")});
 * @private
 */
function _getRequireVar(str) {
    return (str.match(REG_DEFINE) || ["", ""])[1];
}


/**
 * 生成正则
 * @param dep
 * @returns {RegExp}
 * @private
 */
function _buildReg(requireVar, dep) {
    dep = util.fixRegExp(dep).trim();

    return new RegExp("\\b" + util.fixRegExp(requireVar) + "\\(['\"]" + dep + "['\"]\\)");
}
