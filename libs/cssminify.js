/*!
 * cssminify.js
 * @author ydr.me
 * @create 2014-10-23 19:47
 */


"use strict";

var fs = require('fs-extra');
var CleanCSS = require("clean-css");
var log = require('./log.js');
var pathURI = require('./path-uri.js');
var replaceCSSResource = require('./replace-css-resource.js');
var dato = require('ydr-utils').dato;
var typeis = require('ydr-utils').typeis;
var path = require('path');
var defaults = {
    // 高级优化
    advanced: false,
    // 属性合并
    aggressiveMerging: false,
    // 兼容性，“ie7”、“ie8”、“*”（ie9+）
    compatibility: 'ie7',
    // 调试信息
    debug: false,
    // 断行
    keepBreaks: false,
    // 注释
    keepSpecialComments: 0,
    // 媒体查询合并
    mediaMerging: true,
    // url 检查
    rebase: false,
    // 资源地图
    sourceMap: false
};
var cssminify = null;


/**
 * 样式压缩
 * @param file {String} 当前的样式文件
 * @param code {String} 样式文件的代码
 * @param destFile {String} 保存的样式文件
 * @param [callback]
 */
module.exports = function (file, code, destFile, callback) {
    var args = arguments;
    var argL = args.length;
    var isBuildVersion = true;
    var configs = global.configs;

    if (!cssminify) {
        var cleancss = new CleanCSS(dato.extend({}, defaults, configs.css.minify));

        cssminify = function (file, code) {
            return cleancss.minify.call(cleancss, code).styles;
        };
    }

    // cssminify(file, code, destFile, callabck)
    if (typeis.function(args[argL - 1])) {
        callback = args[argL - 1];
        isBuildVersion = false;
    }

    try {
        code = cssminify(file, code, null);

        if (isBuildVersion) {
            code = replaceCSSResource(file, code, destFile, false);
        } else {
            code = replaceCSSResource(file, code, null, true);
        }

        if (callback) {
            callback(null, code);
        } else {
            return code;
        }
    } catch (err) {
        log('cssminify', pathURI.toSystemPath(file), 'error');
        log('cssminify', err.message, 'error');
        process.exit(1);
    }
};


