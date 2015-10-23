/**
 * replace cmd js define
 * @author ydr.me
 * @create 2015-10-23 15:02
 */


'use strict';

var debug = require('ydr-utils').debug;
var dato = require('ydr-utils').dato;

var pathURI = require('../utils/path-uri.js');

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
 * @param file {String} 模块绝对路径
 * @param options {Object} 配置
 * @param options.code {String} 模块压缩后的代码
 * @param options.depIdList {Array} 依赖的模块ID数组
 * @returns {string}
 */
module.exports = function (file, options) {
    var configs = global.configs;
    var code= options.code;
    var depsCode = '';
    var id = configs._moduleIdMap[file];

    if (!id) {
        log('replace define', 'the module ID is undefined in ' + pathURI.toSystemPath(file), 'error');
        process.exit(1);
    }

    depList.forEach(function (dep) {
        var depId = dep.id;

        if (configs._moduleIdMap[depId]) {
            if (depsCode) {
                depsCode += ',';
            }

            depsCode += '"' + configs._moduleIdMap[depId] + '"';
        } else {
            log('replace define', 'can not find ' + configs._moduleIdMap + ' map', 'error');
            process.exit(1);
        }
    });

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



