/**
 * css 压缩
 * @author ydr.me
 * @create 2014-10-23 19:47
 */


'use strict';

var fs = require('fs-extra');
var CleanCSS = require("clean-css");
var dato = require('ydr-utils').dato;
var typeis = require('ydr-utils').typeis;
var path = require('ydr-utils').path;
var debug = require('ydr-utils').debug;

var pathURI = require('../utils/path-uri.js');
var replaceCSSResource = require('../replace/css-resource.js');

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
 * @param options {Object} 配置
 * @param options.code {String} 样式文件的代码
 * @param [options.cleanCSSOptions] {Object} clean-css 配置
 */
module.exports = function (file, options) {
    var code = options.code;

    if (!cssminify) {
        var cleancss = new CleanCSS(dato.extend({}, defaults, options.cleanCSSOptions));

        cssminify = function (file, code) {
            return cleancss.minify.call(cleancss, code).styles;
        };
    }

    try {
        return cssminify(file, code, null);
    } catch (err) {
        debug.error('cssminify', pathURI.toSystemPath(file));
        debug.error('cssminify', err.message);
        process.exit(1);
    }
};


