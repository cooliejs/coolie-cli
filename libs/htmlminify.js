/*!
 * html 去换行和 tab 符
 * @author ydr.me
 * @create 2014-11-03 17:43
 */

'use strict';

var log = require('./log.js');
var cssminify = require('./cssminify.js');
var jsminify = require('./jsminify.js');
var htmlAttr = require('./html-attr.js');
var sign = require('./sign.js');
var dato = require('ydr-utils').dato;
var random = require('ydr-utils').random;
var REG_LINES = /[\n\r\t]/g;
var REG_SPACES = /\s{2,}/g;
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
var REG_IGNORE = /\bcoolieignore\b/i;
var JS_TYPES = [
    'javascript',
    'text/javascript',
    'text/ecmascript',
    'text/ecmascript-6',
    'text/jsx',
    'application/javascript',
    'application/ecmascript'
];


/**
 * html minify
 * @param file
 * @param code
 * @param [callback]
 */
module.exports = function (file, code, callback) {
    var preMap = {};
    var configs = global.configs;

    if (configs.html.minify === false) {
        if (callback) {
            return callback(null, code);
        } else {
            return code;
        }
    }

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
        var isIgnore = htmlAttr.get(tag, 'coolieignore');
        var code2 = isIgnore ? $2 : cssminify(file, $2);

        tag = htmlAttr.remove(tag, 'coolieignore');
        preMap[key] = tag + code2 + '</style>';

        return key;
    });


    // 保存条件注释
    code = code.replace(REG_CONDITIONS_COMMENTS, function ($0) {
        var key = _generateKey();

        preMap[key] = $0;

        return key;
    });


    code = code
        .replace(REG_YUI_COMMENTS, '')
        .replace(REG_LINE_COMMENTS, '')
        .replace(REG_LINES, '')
        .replace(REG_SPACES, ' ');


    // 保存 <script>
    code = code.replace(REG_SCRIPTS, function ($0, $1, $2) {
        var key = _generateKey();
        var tag = $1.replace(REG_LINES, '').replace(REG_SPACES, ' ');
        var type = htmlAttr.get(tag, 'type');
        var isIgnore = htmlAttr.get(tag, 'coolieignore');
        var code2 = $2;

        if (!isIgnore && (type === false || JS_TYPES.indexOf(type) > -1)) {
            code2 = jsminify(file, $2);
        }

        tag = htmlAttr.remove(tag, 'coolieignore');
        preMap[key] = tag + code2 + '</script>';

        return key;
    });


    dato.each(preMap, function (key, val) {
        code = code.replace(key, val);
    });

    code += sign('html');

    if (callback) {
        callback(null, code);
    } else {
        return code;
    }
};


/**
 * 生成随机唯一 KEY
 * @returns {string}
 * @private
 */
function _generateKey() {
    return 'å' + random.string(10, 'aA0') + random.guid() + 'å';
}


/////////////////////////////////
//var html = '<!--\n -会被删除\n-会被删除\n-->' +
//    '<!--\n - app1.html\n - @author abc\n -->' +
//    '\n<!--\n不会被删除\n换行了-->' +
//    '<!--会被删除-->' +
//    '<div data-a="<!--" \ndata-b="不要删除" data-c="-->"></div>' +
//    '\n\n\n      <pre>\n\ttab</pre>\n\n\n' +
//    '\n\n\n      <pre>\n\ttab</pre>';
//module.exports('', html);
