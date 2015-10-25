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
var replaceHTMLTagScript = require('../replace/html-tag-script.js');
// 替换 <style>
var replaceHTMLTagStyleResource = require('../replace/html-tag-style-resource.js');
// 替换 <div style=""
var replaceHTMLAttrStyleResource = require('../replace/html-attr-style-resource.js');
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

var defaults = {
    replaceHTMLAttrResource: false,
    replaceHTMLTagScript: false,
    replaceHTMLTagStyleResource: false,
    replaceHTMLAttrStyleResource: false,
    replaceHTMLCoolieGroup: false,
    removeYUIComments: true,
    removeLineComments: true,
    joinSpaces: true,
    removeBreakLines: true,
    versionLength: 32,
    srcDirname: null,
    destDirname: null,
    destHost: '/',
    destResourceDirname: null,
    minifyResource: true,
    srcCoolieConfigBaseDirname: null,
    destCoolieConfigJSPath: null,
    minifyJS: true
};

/**
 * html minify
 * @param file {String} 文件地址
 * @param options {Object} 配置
 * @param options.code {String} 代码
 * @param [options.replaceHTMLAttrResource=false] {Boolean} 是否替换 html 内的属性资源引用
 * @param [options.replaceHTMLTagScript=false] {Boolean} 是否替换 html 内的 <script>
 * @param [options.replaceHTMLTagStyleResource=false] {Boolean} 是否替换 html 内的 <style>
 * @param [options.replaceHTMLAttrStyleResource=false] {Boolean} 是否替换 html 内的 <div style="">
 * @param [options.replaceHTMLCoolieGroup=false] {Boolean} 是否替换 html 内的 <\!--coolie-->
 * @param [options.removeYUIComments=true] {Boolean} 是否去除 YUI 注释
 * @param [options.removeLineComments=true] {Boolean} 是否去除行注释
 * @param [options.joinSpaces=true] {Boolean} 是否合并空白
 * @param [options.removeBreakLines=true] {Boolean} 是否删除断行
 * @param [options.versionLength=32] {Boolean} 是否删除断行
 * @param [options.srcDirname] {String} 原始根目录
 * @param [options.destDirname] {String} 目标根目录
 * @param [options.destHost] {String} 目标域
 * @param [options.destResourceDirname] {String} 目标资源目录
 * @param [options.minifyResource] {Boolean} 是否压缩引用资源
 * @param [options.srcCoolieConfigBaseDirname] {String} 原始 coolie-config:base 目录
 * @param [options.destCoolieConfigJSPath] {String} 原始 coolie-config.js 路径
 * @param [options.minifyJS=true] {Boolean} 是否压缩 JS
 * @returns {String}
 */
module.exports = function (file, options) {
    options = dato.extend({}, defaults, options);
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

    if (options.removeYUIComments) {
        code = code.replace(REG_YUI_COMMENTS, '');
    }

    if (options.removeLineComments) {
        code = code.replace(REG_LINE_COMMENTS, '');
    }

    if (options.joinSpaces) {
        code = code.replace(REG_SPACES, ' ');
    }

    if (options.removeBreakLines) {
        code = code.replace(REG_LINES, '');
    }

    if (options.replaceHTMLAttrResource) {
        code = replaceHTMLAttrResource(file, {
            versionLength: options.versionLength,
            srcDirname: options.srcDirname,
            destDirname: options.destDirname,
            destHost: options.destHost,
            destResourceDirname: options.destResourceDirname,
            minifyResource: options.minifyResource
        });
    }

    if (options.replaceHTMLTagScript) {
        code = replaceHTMLTagScript(file, {
            code: code,
            srcDirname: options.srcDirname,
            srcCoolieConfigBaseDirname: options.srcCoolieConfigBaseDirname,
            destDirname: options.destDirname,
            destHost: options.destHost,
            destCoolieConfigJSPath: options.destCoolieConfigJSPath,
            versionMap: options.versionMap,
            minifyJS: options.minifyJS
        });
    }

    if(options.replaceHTMLTagStyleResource){
        code = replaceHTMLTagStyleResource(file, {
            code: code,
        });
    }

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



