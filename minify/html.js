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

// 替换 <img src="">
var replaceHTMLAttrResource = require('../replace/html-attr-resource.js');
// 替换 <script>
var replaceHTMLAttrScript = require('../replace/html-attr-script.js');
// 替换 <div style=""
var replaceHTMLStyleResource = require('../replace/html-style-resource.js');
// 替换 <!--coolie-->...<!--/coolie-->
var replaceHTMLCoolieGroup = require('../replace/html-coolie-group.js');

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
var keepSourceList = [
    // <textarea>
    /<(textarea|pre|code|style|script)\b[\s\S]*?>[\s\S]*?<\/\1>/gi,
    //<!--[if IE 6]><![endif]-->
    /<!--\[(if|else if).*?]>([\s\S]*?)<!\[endif]-->/gi,
    // <!--coolie-->
    /<!--\s*?coolie\s*?-->[\s\S]*?<!--\s*?\/coolie\s*?-->/gi
];

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

    // 保留原始格式
    dato.each(keepSourceList, function (index, reg) {
        code = code.replace(reg, function (source) {
            var key = _generateKey();

            preMap[key] = source;

            return key;
        });
    });

    // 先删除 html 注释
    code = code
        .replace(REG_YUI_COMMENTS, '')
        .replace(REG_LINE_COMMENTS, '');

    // 再删除多余空白
    code = code
        .replace(REG_LINES, '')
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



