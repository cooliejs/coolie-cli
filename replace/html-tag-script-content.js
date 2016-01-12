/**
 * html <script> replace
 * @author ydr.me
 * @create 2015-10-22 18:41
 */


'use strict';

var dato = require('ydr-utils').dato;

var copy = require('../utils/copy.js');
var reader = require('../utils/reader.js');
var sign = require('../utils/sign.js');
var minifyJS = require('../minify/js.js');
var parseHTML = require('../parse/html.js');

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
    minifyJS: true,
    uglifyJSOptions: null,
    signJS: false
};


/**
 * 替换 html script
 * @param file {String} 文件
 * @param options {Object} 配置
 * @param options.code {String} 代码
 * @param [options.minifyJS] {Boolean} 是否压缩 JS
 * @param [options.uglifyJSOptions] {Object} uglify-js 配置
 * @param [options.signJS] {Boolean} 是否签名 JS 文件
 * @returns {Object}
 */
module.exports = function (file, options) {
    options = dato.extend(true, {}, defaults, options);
    var code = options.code;
    var mainList = [];
    var jsList = [];

    code = parseHTML(code).match({
        tag: 'script'
    }, function (node) {
        node.attrs = node.attrs || {};

        if (node.attrs.hasOwnProperty(COOLIE_IGNORE)) {
            node.attrs[COOLIE_IGNORE] = null;
            return node;
        }

        if (node.attrs.hasOwnProperty('src')) {
            return node;
        }

        var type = node.attrs.type || DEFAULT_JS_TYPE;
        var isJS = JS_TYPES[type];

        if (!isJS) {
            return node;
        }

        node.content = minifyJS(file, {
            code: node.content,
            uglifyJSOptions: options.uglifyJSOptions
        });

        if (options.signJS) {
            node.content = sign.js() + node.content;
        }

        node.content = node.content.replace(/}}(;?)$/, '}/**/};');

        return node;
    }).exec();

    return {
        code: code,
        mainList: mainList,
        jsList: jsList
    };
};
