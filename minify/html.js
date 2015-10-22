/**
 * html 压缩
 * @author ydr.me
 * @create 2015-10-22 16:16
 */


'use strict';


var path = require('ydr-utils').path;
var debug = require('ydr-utils').debug;
var dato = require('ydr-utils').dato;
var random = require('ydr-utils').random;

var cssminify = require('./css.js');
var jsminify = require('./js.js');
var htmlAttr = require('../utils/html-attr.js');
var sign = require('../utils/sign.js');
var replaceHTMLResource = require('../replace/html-resource.js');

var REG_LINES = /[\n\r]/g;
var REG_SPACES = /\s{2,}|\t/g;
// 单行注释
var REG_LINE_COMMENTS = /<!--.*?-->/g;
// yui注释
//<!--
// - app1.html
// - @author ydr.me
// - @create 2014-09-25 19:20
// -->
var REG_YUI_COMMENTS = /<!--\s*\n(\s*?-.*\n)+\s*-->/g;
var REG_TEXTAREAS = /(<textarea\b[\s\S]*?>)([\s\S]*?)<\/textarea>/ig;
var REG_PRES = /(<pre\b[\s\S]*?>)([\s\S]*?)<\/pre>/ig;
var REG_STYLES = /(<style\b[\s\S]*?>)([\s\S]*?)<\/style>/ig;
var REG_SCRIPTS = /(<script\b[\s\S]*?>)([\s\S]*?)<\/script>/ig;
//<!--[if IE 6]><![endif]-->
var REG_CONDITIONS_COMMENTS = /<!--\[(if|else if).*?]>([\s\S]*?)<!\[endif]-->/i;
// 有歧义的代码片段
var REG_AMBIGUITY_SLICE = /}};?<\/script>$/;
var JS_TYPES = [
    'javascript',
    'text/javascript',
    'text/ecmascript',
    'text/ecmascript-6',
    'text/jsx',
    'application/javascript',
    'application/ecmascript'
];
var coolieIgnore = 'coolieignore';


/**
 * html minify
 * @param file {String} 文件地址
 * @param options {Object} 配置
 * @param options.code {String} 代码
 * @returns {String}
 */
module.exports = function (file, options) {
    var preMap = {};
    var code = options.code;

    // 保存 <textarea>
    code = code.replace(REG_TEXTAREAS, function ($0, $1, $2) {
        var key = _generateKey();

        preMap[key] = $1.replace(REG_LINES, '').replace(REG_SPACES, ' ') + $2 + '</textarea>';

        return key;
    });

    // 保存 <pre>
    code = code.replace(REG_PRES, function ($0, $1, $2) {
        var key = _generateKey();

        preMap[key] = $1.replace(REG_LINES, '').replace(REG_SPACES, ' ') + $2 + '</pre>';

        return key;
    });


    // 保存 <style>
    code = code.replace(REG_STYLES, function ($0, $1, $2) {
        var key = _generateKey();
        var tag = $1.replace(REG_LINES, '').replace(REG_SPACES, ' ');
        var isIgnore = htmlAttr.get(tag, coolieIgnore);
        var type = htmlAttr.get(tag, 'type');
        var code2 = '';

        // 忽略 || 非样式内容
        if (isIgnore || type && type !== 'text/css') {
            code2 = $2;
        } else {
            code2 = cssminify(file, $2, null);
        }

        tag = htmlAttr.remove(tag, coolieIgnore);
        preMap[key] = tag + code2 + '</style>';

        return key;
    });


    // 保存条件注释
    code = code.replace(REG_CONDITIONS_COMMENTS, function ($0) {
        var key = _generateKey();

        preMap[key] = $0;

        return key;
    });


    // 先删除 html 注释
    code = code
        .replace(REG_YUI_COMMENTS, '')
        .replace(REG_LINE_COMMENTS, '');


    // 保存 <script>
    code = code.replace(REG_SCRIPTS, function ($0, scriptTag, scriptCode) {
        var key = _generateKey();
        var tag = scriptTag.replace(REG_LINES, '').replace(REG_SPACES, ' ');
        var type = htmlAttr.get(tag, 'type');
        var isIgnore = htmlAttr.get(tag, coolieIgnore);
        var code2 = scriptCode;

        if (!isIgnore && (type === false || JS_TYPES.indexOf(type) > -1)) {
            code2 = jsminify(file, {
                code: scriptCode
            });
        }

        tag = htmlAttr.remove(tag, coolieIgnore);
        preMap[key] = (tag + code2 + '</script>');

        // 消除歧义
        // <script>var a = {b:{}};</script>
        //                     ^ 该`}}`在对应的模板引擎里会出错
        if (!isIgnore && (type === false || JS_TYPES.indexOf(type) > -1)) {
            preMap[key] = preMap[key].replace(REG_AMBIGUITY_SLICE, '}/**/}</script>');
        }

        return key;
    });

    // 再删除多余空白
    code = code.replace(REG_LINES, '')
        .replace(REG_SPACES, ' ');

    // 恢复预格式
    dato.each(preMap, function (key, val) {
        code = code.replace(key, val);
    });

    return code;
};


/**
 * 生成随机唯一 KEY
 * @returns {string}
 * @private
 */
function _generateKey() {
    return 'å' + random.string(10, 'aA0') + random.guid() + 'å';
}



