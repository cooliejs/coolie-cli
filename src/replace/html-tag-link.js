/**
 * replace html link
 * @author ydr.me
 * @create 2015-12-17 11:14
 */


'use strict';

var object = require('blear.utils.object');
var console = require('blear.node.console');


var copy = require('../utils/copy.js');
var parseHTML = require('../parse/html.js');
var buildCSSPath = require('../build/css-path.js');
var progress = require('../utils/progress.js');


var COOLIE_IGNORE = 'coolieignore';
var defaults = {
    code: '',
    srcDirname: null,
    destDirname: null,
    destHost: '/',
    destCSSDirname: null,
    destResourceDirname: null,
    versionLength: 32,
    minifyCSS: true,
    cleanCSSOptions: null,
    signCSS: false,
    mute: false
};


/**
 * 替换 html script
 * @param file {String} 文件
 * @param options {Object} 配置
 * @param options.code {String} 代码
 * @param options.srcDirname {String} 构建根目录
 * @param options.destDirname {String} 目标根目录
 * @param options.destHost {String} 目标根域
 * @param options.destCSSDirname {String} 目标 CSS 目录
 * @param options.destResourceDirname {String} 目标资源目录
 * @param options.versionLength {Number} 版本号长度
 * @param [options.minifyCSS] {Boolean} 是否压缩 CSS
 * @param [options.minifyResource] {Boolean} 是否压缩静态资源
 * @param [options.cleanCSSOptions] {Object} clean-css 配置
 * @param [options.signCSS] {Boolean} 是否签名 CSS 文件
 * @param [options.mute] {Boolean} 是否静音
 * @returns {{code: String, cssList: Array}}
 * @param [options.progressKey] {String} 进度日志键
 * @param [options.middleware] {Object} 中间件
 */
module.exports = function (file, options) {
    options = object.assign({}, defaults, options);
    var code = options.code;
    var cssList = [];

    code = parseHTML(code).match({
        tag: 'link',
        attrs: {
            rel: 'stylesheet'
        }
    }, function (node) {
        if (!node.attrs || !node.attrs.href) {
            return node;
        }

        if (node.attrs.hasOwnProperty(COOLIE_IGNORE)) {
            node.attrs[COOLIE_IGNORE] = null;
            return node;
        }

        var href = node.attrs.href;
        href = options.middleware.exec({
            file: file,
            progress: 'pre-static',
            type: 'css',
            path: href
        }).path || href;
        var ret = buildCSSPath(href, {
            file: file,
            srcDirname: options.srcDirname,
            destDirname: options.destDirname,
            destHost: options.destHost,
            destResourceDirname: options.destResourceDirname,
            destCSSDirname: options.destCSSDirname,
            minifyResource: options.minifyResource,
            minifyCSS: options.minifyCSS,
            versionLength: options.versionLength,
            signCSS: options.signCSS,
            cleanCSSOptions: options.cleanCSSOptions,
            mute: options.mute,
            middleware: _options.middleware
        });

        if (!ret) {
            return node;
        }

        cssList.push({
            destPath: ret.destFile,
            dependencies: [{
                srcPath: ret.srcFile,
                resList: ret.resList
            }]
        });
        node.attrs.href = ret.url;

        if (options.progressKey) {
            progress.run(options.progressKey, ret.srcURL);
        }
        
        return node;
    }).exec();

    return {
        code: code,
        cssList: cssList
    };
};


