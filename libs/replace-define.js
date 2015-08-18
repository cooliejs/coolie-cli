/*!
 * 替换 define
 * @author ydr.me
 * @create 2014-10-23 21:26
 */


'use strict';

var log = require('./log.js');
var pathURI = require('./path-uri.js');
var dato = require('ydr-utils').dato;
// define&&define.amd?define(function(
// define(function(
// define( "jquery", [], function() {
var REG_DEFINE_1 = /\bdefine\((.*)\bfunction\(/;


// define&&define.amd?define(e)
// define(e)
var REG_DEFINE_2 = /\bdefine\(([^,)]*?)\)/;



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

    code = code
        .replace(REG_DEFINE_1, 'define("' + id + '",[' + depsCode + '],function(')
        .replace(REG_DEFINE_2, 'define("' + id + '",[' + depsCode + '],$1)');

    return code;
};
