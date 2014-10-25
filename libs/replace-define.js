/*!
 * 替换 define
 * @author ydr.me
 * @create 2014-10-23 21:26
 */


"use strict";

var log = require("../libs/log.js");
var util = require("../libs/util.js");
var REG_DEFINE = /\bdefine\s*?\(.*?function/;


/**
 * 替换 define
 * @param file 模块绝对路径
 * @param code 模块压缩后的代码
 * @param deps 模块依赖
 * @param depIdsMap 依赖对应表
 * @returns {string}
 */
module.exports = function (file, code, deps, depIdsMap) {
    var depsCode = "";
    var id = depIdsMap[file];

    if (!id) {
        log("replace define", "the module ID is undefined in " + util.fixPath(file), "error");
        process.exit();
    }

    deps.forEach(function (dep) {
        if (depIdsMap[dep]) {
            if (depsCode) {
                depsCode += ",";
            }

            depsCode += "\"" + depIdsMap[dep] + "\"";
        } else {
            log("replace define", "can not find " + dep + " map", "error");
            process.exit();
        }
    });

    return code.replace(REG_DEFINE, "define(\"" + id + "\",[" + depsCode + "],function");
};
