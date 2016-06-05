/**
 * css 压缩
 * @author ydr.me
 * @create 2014-10-23 19:47
 */


'use strict';

var fs = require('fs-extra');
var CleanCSS = require("clean-css");
var dato = require('ydr-utils').dato;
var path = require('ydr-utils').path;
var debug = require('blear.node.debug');
var console = require('blear.node.console');


var replaceCSSResource = require('../replace/css-resource.js');

var cleanCSSOptions = {
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
    // * 保留所有
    // 1 保留第一行
    // 0 移除所有
    keepSpecialComments: 0,
    // 媒体查询合并
    mediaMerging: true,
    // url 检查
    rebase: false,
    // 资源地图
    sourceMap: false
};
var defaults = {
    cleanCSSOptions: null,
    versionLength: 32,
    srcDirname: null,
    destDirname: null,
    destHost: null,
    destResourceDirname: null,
    mute: false,
    destCSSDirname: null,
    minifyResource: true,
    replaceCSSResource: true
};
var cssminify = null;


/**
 * 样式压缩
 * @param file {String} 当前的样式文件
 * @param options {Object} 配置
 * @param options.code {String} 样式文件的代码
 * @param [options.cleanCSSOptions] {Object} clean-css 配置
 * @param options.versionLength {Number} 版本长度
 * @param options.srcDirname {String} 构建工程原始根目录
 * @param options.destDirname {String} 目标根目录
 * @param options.destHost {String} 目标文件 URL 域
 * @param options.destResourceDirname {String} 目标资源文件保存目录
 * @param options.mute {Boolean} 是否静音
 * @param [options.destCSSDirname] {String} 目标样式文件目录，如果存在，则资源相对路径
 * @param [options.minifyResource] {Boolean} 压缩资源文件
 * @param [options.replaceCSSResource] {Boolean} 是否替换 css 内引用文件
 * @returns {{code: String, resList: Array}}
 */
module.exports = function (file, options) {
    options = dato.extend({}, defaults, options);
    var code = options.code;
    var resList = [];

    if (!cssminify) {
        cssminify = new CleanCSS(dato.extend({}, cleanCSSOptions, options.cleanCSSOptions));
    }

    try {
        code = cssminify.minify(code).styles;
        if (options.replaceCSSResource) {
            var replaceCSSResourceRet = replaceCSSResource(file, {
                code: code,
                versionLength: options.versionLength,
                srcDirname: options.srcDirname,
                destDirname: options.destDirname,
                destHost: options.destHost,
                destResourceDirname: options.destResourceDirname,
                destCSSDirname: options.destCSSDirname,
                minifyResource: options.minifyResource,
                mute: options.mute
            });
            code = replaceCSSResourceRet.code;
            resList = replaceCSSResourceRet.resList;
        }

        return {
            code: code,
            resList: resList
        };
    } catch (err) {
        debug.error('cssminify', path.toSystem(file));
        debug.error('cssminify', err.message);
        process.exit(1);
    }
};


