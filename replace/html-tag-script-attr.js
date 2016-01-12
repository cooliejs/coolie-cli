/**
 * html <script> replace
 * @author ydr.me
 * @create 2015-10-22 18:41
 */


'use strict';

var dato = require('ydr-utils').dato;
var path = require('ydr-utils').path;

var copy = require('../utils/copy.js');
var reader = require('../utils/reader.js');
var parseHTML = require('../parse/html.js');
var buildJSPath = require('../build/js-path.js');

var JS_TYPES = {
    'javascript': true,
    'text/javascript': true,
    'text/ecmascript': true,
    'text/ecmascript-6': true,
    'text/jsx': true,
    'application/javascript': true,
    'application/ecmascript': true
};
var DEFAULT_JS_TYPE = 'text/javascript';
var COOLIE_IGNORE = 'coolieignore';
var defaults = {
    code: '',
    srcDirname: null,
    destJSDirname: null,
    destDirname: null,
    destHost: '/',
    versionLength: 32,
    minifyJS: true,
    uglifyJSOptions: null,
    signJS: false
};


/**
 * 替换 html script
 * @param file {String} 文件
 * @param options {Object} 配置
 * @param options.code {String} 代码
 * @param options.srcDirname {String} 构建根目录
 * @param options.destDirname {String} 目标根目录
 * @param options.destHost {String} 目标根域
 * @param options.destJSDirname {String} 目标 JS 目录
 * @param options.versionLength {Number} 版本号长度
 * @param [options.minifyJS] {Boolean} 是否压缩 JS
 * @param [options.uglifyJSOptions] {Object} uglify-js 配置
 * @param [options.signJS] {Boolean} 是否签名 JS 文件
 * @returns {Object}
 */
module.exports = function (file, options) {
    options = dato.extend(true, {}, defaults, options);
    var code = options.code;
    var jsList = [];


    code = parseHTML(code).match({
        tag: 'script'
    }, function (node) {
        if (!node.attrs) {
            return node;
        }

        if (!node.attrs.hasOwnProperty('src')) {
            return node;
        }

        if (node.attrs.hasOwnProperty(COOLIE_IGNORE)) {
            node.attrs[COOLIE_IGNORE] = null;
            return node;
        }

        var type = node.attrs.type || DEFAULT_JS_TYPE;
        var isJS = JS_TYPES[type];

        if (!isJS) {
            return node;
        }

        var ret = buildJSPath(node.attrs.src, {
            file: file,
            srcDirname: options.srcDirname,
            destDirname: options.destDirname,
            destHost: options.destHost,
            destJSDirname: options.destJSDirname,
            minifyJS: options.minifyJS,
            uglifyJSOptions: options.uglifyJSOptions,
            versionLength: options.versionLength,
            signJS: options.signJS
        });

        if (!ret) {
            return node;
        }

        jsList.push({
            destPath: ret.destFile,
            dependencies: [ret.srcFile]
        });

        node.attrs.src = ret.url;
        return node;
    }).exec();

    return {
        code: code,
        jsList: jsList
    };
};
