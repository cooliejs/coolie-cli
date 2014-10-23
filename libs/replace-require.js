/*!
 * 替换 require 字符串
 * @author ydr.me
 * @create 2014-10-23 20:50
 */


"use strict";

var REG_H = /\//g;


/**
 * 替换 require
 * @param code 代码必须先进行压缩过后的，保证没有其他注释干扰
 * @param deps 依赖数组
 * @param depsMap 依赖对应表
 */
module.exports = function (code, deps, depsMap) {
    deps.forEach(function (dep) {
        code = code.replace(_buildReg(dep), "require(\"" + depsMap[dep] + "\")");
    });

    return code;
};


/**
 * 生成正则
 * @param dep
 * @returns {RegExp}
 * @private
 */
function _buildReg(dep) {
    return new RegExp("require\\([\"']" + dep.replace(REG_H, "\\/") + "[\"']\\)");
}
