/**
 * html style="" resource
 * @author ydr.me
 * @create 2015-10-22 17:41
 */


'use strict';

var dato = require('ydr-utils').dato;
var debug = require('ydr-utils').debug;

var parseHTML = require('../parse/html.js');
var replaceCSSResource = require('./css-resource.js');

var COOLIE_IGNORE = 'coolieignore';
var REG_LINES = /[\n\r]/g;
var REG_SPACES = /\s+/g;
var defaults = {
    code: '',
    versionLength: 32,
    srcDirname: null,
    destDirname: null,
    destHost: '/',
    destResourceDirname: null,
    minifyResource: true,
    minifyCSS: true
};


/**
 * 替换 html style 资源
 * @param file {String} 文件
 * @param options {Object} 配置
 * @param options.code {String} 代码
 * @param options.versionLength {Number} 版本长度
 * @param options.srcDirname {String} 构建工程原始根目录
 * @param options.destDirname {String} 目标根目录
 * @param options.destHost {String} 目标文件 URL 域
 * @param options.destResourceDirname {String} 目标资源文件保存目录
 * @param [options.minifyResource] {Boolean} 压缩资源文件
 * @param [options.minifyCSS] {Boolean} 是否压缩 CSS
 * returns {{code: String, resList: Array}}
 */
module.exports = function (file, options) {
    options = dato.extend({}, defaults, options);
    var code = options.code;
    var resList = [];

    code = parseHTML(code).match(function (node) {
        if (!node.attrs || !node.attrs.style) {
            return node;
        }

        if (node.attrs.hasOwnProperty(COOLIE_IGNORE)) {
            node.attrs[COOLIE_IGNORE] = null;
            return node;
        }

        var styleCode = node.attrs.style;
        var replaceCSSResourceRet = replaceCSSResource(file, {
            code: styleCode,
            destCSSDirname: null,
            versionLength: options.versionLength,
            srcDirname: options.srcDirname,
            destDirname: options.destDirname,
            destHost: options.destHost,
            destResourceDirname: options.destResourceDirname
        });

        styleCode = replaceCSSResourceRet.code;
        resList = replaceCSSResourceRet.resList;

        if (options.minifyCSS) {
            styleCode = styleCode.replace(REG_LINES, '').replace(REG_SPACES, ' ');
        }

        node.attrs.style = styleCode;
        return node;
    }).exec();

    return {
        code: code,
        resList: resList
    };
};



