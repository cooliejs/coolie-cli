/**
 * html <script> replace
 * @author ydr.me
 * @create 2015-10-22 18:41
 */


'use strict';

var object = require('blear.utils.object');
var console = require('blear.node.console');

var copy = require('../utils/copy.js');
var sign = require('../utils/sign.js');
var minifyJS = require('../minify/js.js');
var parseHTML = require('../parse/html.js');
var progress = require('../utils/progress.js');

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
    signJS: false,
    mute: false
};


/**
 * 替换 html script
 * @param file {String} 文件
 * @param options {Object} 配置
 * @param options.code {String} 代码
 * @param [options.minifyJS] {Boolean} 是否压缩 JS
 * @param [options.uglifyJSOptions] {Object} uglify-js 配置
 * @param [options.signJS] {Boolean} 是否签名 JS 文件
 * @param [options.mute] {Boolean} 是否静音
 * @param [options.progressKey] {String} 进度日志键
 * @param [options.middleware] {Object} 中间件
 * @returns {Object}
 */
module.exports = function (file, options) {
    options = object.assign(true, {}, defaults, options);
    var code = options.code;
    var mainList = [];
    var jsList = [];

    code = parseHTML(code).match({
        tag: 'script',
        nest: false
    }, function (node) {
        if (node.attrs.hasOwnProperty('src')) {
            return node;
        }

        var type = node.attrs.type || DEFAULT_JS_TYPE;
        var isJS = JS_TYPES[type];

        if (!isJS) {
            return node;
        }

        if (!node.content) {
            return node;
        }

        if (node.attrs.hasOwnProperty(COOLIE_IGNORE)) {
            node.attrs[COOLIE_IGNORE] = null;
            return node;
        }

        node.content = minifyJS(file, {
            code: node.content,
            uglifyJSOptions: options.uglifyJSOptions,
            mute: options.mute
        });

        if (options.signJS) {
            node.content = sign.js() + node.content;
        }

        // var a= {a: {b: 2}};
        //                  ^ 被模板引擎当做了界定符
        node.content = node.content.replace(/(}{2,});?$/, function (source, matched) {
            return matched.split('').join('/**/') + ';';
        });

        return node;
    }).exec();

    return {
        code: code,
        mainList: mainList,
        jsList: jsList
    };
};
