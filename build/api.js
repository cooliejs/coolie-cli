/**
 * coolie-cli API 出口
 * @author ydr.me
 * @create 2016-01-12 20:34
 */


'use strict';

var dato = require('ydr-utils').dato;

var parseHTML = require('../parse/html.js');
var buildCSSPath = require('../build/css-path.js');
var buildJSPath = require('../build/js-path.js');
var buildResPath = require('../build/res-path.js');


/**
 * coolie-cli API 出口
 * @param options {Object} 配置
 * @param [options.coolieAPI] {Object} coolie API
 * @param options.srcDirname {String} 原始路径
 * @param options.destDirname {String} 目标路径
 * @param options.destDirname {String} 目标路径
 * @param options.destHost {String} 目标域
 * @param options.destResourceDirname {String} 目标资源路径
 * @param options.destJSDirname {String} 目标 css 路径
 * @param options.destCSSDirname {String} 目标 css 路径
 * @param options.minifyCSS {Boolean} 是否压缩 css
 * @param options.minifyResource {Boolean} 是否压缩资源
 * @param options.versionLength {Number} 版本号长度
 * @param options.signJS {Boolean} 是否签名 js
 * @param options.signCSS {Boolean} 是否签名 css
 * @param options.uglifyJSOptions {Object} uglify-js 配置
 * @param options.cleanCSSOptions {Object} clean-css 配置
 * @returns {{}}
 */
module.exports = function (options) {
    var coolieAPI = options.coolieAPI;

    /**
     * 匹配 HTML 并转换
     * @param html {String} 原始 HTML
     * @param conditions {Object} 匹配条件，参考 posthtml
     * @param transform {Function} 转换方法，参考 posthtml
     * @returns {string}
     */
    coolieAPI.matchHTML = function (html, conditions, transform) {
        return parseHTML(html).match(conditions, transform).exec();
    };


    /**
     * 构建 css 路径
     * @param url {String} url
     * @param file {String} 所在的文件路径
     * @param [_options] {Object}
     * @param [_options.srcDirname]
     * @param [_options.destDirname]
     * @param [_options.destHost]
     * @param [_options.destResourceDirname]
     * @param [_options.destCSSDirname]
     * @param [_options.minifyCSS]
     * @param [_options.minifyResource]
     * @param [_options.versionLength]
     * @param [_options.signCSS]
     * @param [_options.cleanCSSOptions]
     * @returns {{url, srcFile, destFile, resList}|*}
     */
    coolieAPI.buildCSSPath = function (url, file, _options) {
        _options = dato.extend({}, options, _options);
        return buildCSSPath(url, {
            file: file,
            srcDirname: _options.srcDirname,
            destDirname: _options.destDirname,
            destHost: _options.destHost,
            destResourceDirname: _options.destResourceDirname,
            destCSSDirname: _options.destCSSDirname,
            minifyCSS: _options.minifyCSS,
            minifyResource: _options.minifyResource,
            versionLength: _options.versionLength,
            signCSS: _options.signCSS,
            cleanCSSOptions: _options.cleanCSSOptions
        });
    };


    /**
     * 构建 js 路径
     * @param url {String} url
     * @param file {String} 所在的文件路径
     * @param [_options] {Object}
     * @param [_options.srcDirname]
     * @param [_options.destDirname]
     * @param [_options.destHost]
     * @param [_options.destJSDirname]
     * @param [_options.minifyJS]
     * @param [_options.versionLength]
     * @param [_options.signJS]
     * @param [_options.uglifyJSOptions]
     * @returns {{srcFile, destFile, url}|*}
     */
    coolieAPI.buildJSPath = function (url, file, _options) {
        _options = dato.extend({}, options, _options);
        return buildJSPath(url, {
            file: file,
            srcDirname: _options.srcDirname,
            destDirname: _options.destDirname,
            destHost: _options.destHost,
            destJSDirname: _options.destJSDirname,
            minifyJS: _options.minifyJS,
            uglifyJSOptions: _options.uglifyJSOptions,
            versionLength: _options.versionLength,
            signJS: _options.signJS
        });
    };


    /**
     * 构建资源路径
     * @param url {String} url
     * @param file {String} 所在的文件路径
     * @param [_options] {Object}
     * @param [_options.srcDirname]
     * @param [_options.destDirname]
     * @param [_options.destHost]
     * @param [_options.destResourceDirname]
     * @param [_options.versionLength]
     * @returns {{srcFile, destFile, url}|*}
     */
    coolieAPI.buildResPath = function (url, file, _options) {
        _options = dato.extend({}, options, _options);
        return buildResPath(url, {
            file: file,
            versionLength: _options.versionLength,
            srcDirname: _options.srcDirname,
            destDirname: _options.destDirname,
            destResourceDirname: _options.destResourceDirname,
            destHost: _options.destHost
        });
    };

    return coolieAPI;
};



