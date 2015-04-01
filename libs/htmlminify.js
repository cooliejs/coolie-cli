/*!
 * html 去换行和 tab 符
 * @author ydr.me
 * @create 2014-11-03 17:43
 */

'use strict';

var log = require('./log.js');
var dato = require('ydr-util').dato;
var random = require('ydr-util').random;
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
var REG_PRES = /<pre\b.*?>[\s\S]*?<\/pre>/ig;
var REG_SCRIPTS = /<script\b.*?>[\s\S]*?<\/script>/ig;


/**
 * html minify
 * @param file
 * @param code
 * @param [callback]
 */
module.exports = function (file, code, callback) {
    // 保存 <pre>
    var preMap = {};
    code = code.replace(REG_PRES, function ($0) {
        var key = _generateKey();

        preMap[key] = $0;

        return key;
    });

    code = code.replace(REG_SCRIPTS, function ($0) {
        var key = _generateKey();

        preMap[key] = $0;

        return key;
    });


    code = code
        .replace(REG_YUI_COMMENTS, '')
        .replace(REG_LINE_COMMENTS, '')
        .replace(REG_LINES, '')
        .replace(REG_SPACES, ' ');


    dato.each(preMap, function (key, val) {
        code = code.replace(key, val);
    });

    //console.log(code);

    if (callback) {
        callback(null, code);
    } else {
        return code;
    }
};


/**
 * 生成随机 42 位的 KEY
 * @returns {string}
 * @private
 */
function _generateKey() {
    return '`' + random.string(40, 'aA0') + '`';
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
