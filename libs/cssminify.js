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
var encryption = require('ydr-utils').encryption;
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
var REG_URL = /url\s*?\((.*?)\)/ig;
var REG_REMOTE = /^(https?:)?\/\//i;
var REG_SUFFIX = /(\?.*|#.*)$/;
var REG_ABSPATH = /^\//;
var REG_QUOTE = /^["']|['"]$/g;
var buildMap = {};


/**
 * 样式压缩
 * @param file
 * @param code
 * @param [destFile]
 * @param [callback]
 */
module.exports = function (file, code, destFile, callback) {
    var args = arguments;
    var isBuildVersion = true;
    var configs = global.configs;

    if (!cssminify) {
        var cleancss = new CleanCSS(dato.extend({}, defaults, configs.css.minify));

        cssminify = function (file, code) {
            return cleancss.minify.call(cleancss, code).styles;
        };
    }

    // cssminify(file, code)
    // cssminify(file, code, callabck)
    if (typeis.function(args[2]) || typeis.undefined(args[2])) {
        callback = args[2];
        isBuildVersion = false;
    }


    try {
        code = cssminify(file, code);

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
        process.exit();
    }
};


