/*!
 * 替换 define
 * @author ydr.me
 * @create 2014-10-23 21:26
 */


'use strict';

var log = require('./log.js');
var pathURI = require('./path-uri.js');
var dato = require('ydr-utils').dato;

// define(a, b, function( => define(function(
var REG_DEFINE_FUNCTION = /([^.\["]|^)\bdefine\(([^,)]*?,){0,2}function\(/;
var REG_DEFINE_1 = /([^.\["]|^)\bdefine\([^,)]*?,[^,)]*?,function\(/;
var REG_DEFINE_2 = /([^.\["]|^)\bdefine\([^,)]*?,function\(/;

// define(a, b, c) => define(c)
var REG_DEFINE_3 = /([^.\["]|^)\bdefine\([^,)]*?,[^,)]*?,([^,)]*?)\)/;

// define(a, c) => define(c)
var REG_DEFINE_4 = /([^.\["]|^)\bdefine\([^,)]*?,([^,)]*?)\)/;

// define(c) => define(id, deps, c)
// define(function() => define(id, deps, function()
var REG_DEFINE_5 = /([^.\["]|^)\bdefine\((.*?)\)/;


/**
 * 替换 define
 * @param file 模块绝对路径
 * @param code 模块压缩后的代码
 * @param depList 模块依赖
 * @param depIdsMap 依赖对应表
 * @returns {string}
 */
module.exports = function (file, code, depList, depIdsMap) {
    var depsCode = '';
    var id = depIdsMap[file];

    if (!id) {
        log('replace define', 'the module ID is undefined in ' + pathURI.toSystemPath(file), 'error');
        process.exit(1);
    }

    depList.forEach(function (dep) {
        var depId = dep.id;

        if (depIdsMap[depId]) {
            if (depsCode) {
                depsCode += ',';
            }

            depsCode += '"' + depIdsMap[depId] + '"';
        } else {
            log('replace define', 'can not find ' + depIdsMap + ' map', 'error');
            process.exit(1);
        }
    });

    //console.log(code);
    //code = code
    //    .replace(REG_DEFINE_1, 'define("' + id + '",[' + depsCode + '],$1)')
    //    .replace(REG_DEFINE_2, 'define("' + id + '",[' + depsCode + '],function(');

    if (REG_DEFINE_FUNCTION.test(code)) {
        code = code.replace(REG_DEFINE_1, '$1define(function(');
        code = code.replace(REG_DEFINE_2, '$1define(function(');
    } else {
        code = code.replace(REG_DEFINE_3, '$1define($2)');
        code = code.replace(REG_DEFINE_4, '$1define($2)');
    }

    code = code.replace(REG_DEFINE_5, '$1define("' + id + '",[' + depsCode + '],$2)');

    return code;
};
