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

var sign = require('../utils/sign.js');

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
    // <!--coolie-->
    /<!--\s*?coolie\s*?-->[\s\S]*?<!--\s*?\/coolie\s*?-->/gi,
    // <textarea>
    /<(textarea|pre|code|style|script)\b[\s\S]*?>[\s\S]*?<\/\1>/gi,
    //<!--[if IE 6]><![endif]-->
    /<!--\[(if|else if).*?]>([\s\S]*?)<!\[endif]-->/gi
];

var defaults = {
    code: '',
    replaceHTMLAttrResource: false,
    replaceHTMLTagScript: false,
    replaceHTMLTagStyleResource: false,
    replaceHTMLAttrStyleResource: false,
    replaceHTMLCoolieGroup: false,
    removeHTMLYUIComments: true,
    removeHTMLLineComments: true,
    joinHTMLSpaces: true,
    removeHTMLBreakLines: true,
    versionLength: 32,
    srcDirname: null,
    destDirname: null,
    destJSDirname: null,
    destCSSDirname: null,
    destResourceDirname: null,
    destHost: '/',
    srcCoolieConfigBaseDirname: null,
    destCoolieConfigJSPath: null,
    minifyJS: true,
    minifyCSS: true,
    minifyResource: true,
    uglifyJSOptions: null,
    cleanCSSOptions: null,
    replaceCSSResource: true,
    mainVersionMap: null,
    signHTML: false,
    signJS: false,
    signCSS: false
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
 * @param [options.removeHTMLYUIComments=true] {Boolean} 是否去除 YUI 注释
 * @param [options.removeHTMLLineComments=true] {Boolean} 是否去除行注释
 * @param [options.joinHTMLSpaces=true] {Boolean} 是否合并空白
 * @param [options.removeHTMLBreakLines=true] {Boolean} 是否删除断行
 * @param [options.versionLength=32] {Number} 版本号长度
 * @param [options.srcDirname] {String} 原始根目录
 * @param [options.destDirname] {String} 目标根目录
 * @param [options.destJSDirname] {String} 目标 JS 目录
 * @param [options.destCSSDirname] {String} 目标 CSS 目录
 * @param [options.destResourceDirname] {String} 目标资源目录
 * @param [options.destHost] {String} 目标域
 * @param [options.srcCoolieConfigBaseDirname] {String} 原始 coolie-config:base 目录
 * @param [options.destCoolieConfigJSPath] {String} 目标 coolie-config.js 路径
 * @param [options.minifyJS=true] {Boolean} 是否压缩 JS
 * @param [options.minifyCSS=true] {Boolean} 是否压缩 CSS
 * @param [options.minifyResource=true] {Boolean} 是否压缩引用资源
 * @param [options.uglifyJSOptions=null] {Boolean} 压缩 JS 配置
 * @param [options.cleanCSSOptions=null] {Boolean} 压缩 CSS 配置
 * @param [options.replaceCSSResource=true] {Boolean} 是否替换 css 引用资源
 * @param [options.mainVersionMap] {Object} 入口模块版本信息
 * @param [options.signHTML] {Boolean} 是否签名 html 文件
 * @param [options.signJS] {Boolean} 是否签名 js 文件
 * @param [options.signCSS] {Boolean} 是否签名 css 文件
 * @returns {Object}
 */
module.exports = function (file, options) {
    options = dato.extend({}, defaults, options);
    var preMap = {};
    var code = options.code;
    var mainList = [];
    var jsList = [];
    var cssList = [];

    // 保留原始格式
    dato.each(keepSourceList, function (index, reg) {
        preMap[index] = {};
        code = code.replace(reg, function (source) {
            var key = _generateKey();

            preMap[index][key] = source;

            return key;
        });
    });

    if (options.removeHTMLYUIComments) {
        code = code.replace(REG_YUI_COMMENTS, '');
    }

    if (options.removeHTMLLineComments) {
        code = code.replace(REG_LINE_COMMENTS, '');
    }

    if (options.joinHTMLSpaces) {
        code = code.replace(REG_SPACES, ' ');
    }

    if (options.removeHTMLBreakLines) {
        code = code.replace(REG_LINES, '');
    }

    // 恢复标签
    dato.each(preMap[1], function (key, val) {
        code = code.replace(key, val);
    });
    dato.each(preMap[2], function (key, val) {
        code = code.replace(key, val);
    });

    if (options.replaceHTMLAttrResource) {
        code = replaceHTMLAttrResource(file, {
            code: code,
            versionLength: options.versionLength,
            srcDirname: options.srcDirname,
            destDirname: options.destDirname,
            destHost: options.destHost,
            destResourceDirname: options.destResourceDirname,
            minifyResource: options.minifyResource
        });
    }

    if (options.replaceHTMLTagScript) {
        var replaceHTMLTagScriptRet = replaceHTMLTagScript(file, {
            code: code,
            srcDirname: options.srcDirname,
            srcCoolieConfigBaseDirname: options.srcCoolieConfigBaseDirname,
            destDirname: options.destDirname,
            destHost: options.destHost,
            destJSDirname: options.destJSDirname,
            destCoolieConfigJSPath: options.destCoolieConfigJSPath,
            mainVersionMap: options.mainVersionMap,
            minifyJS: options.minifyJS,
            returnObject: options.returnObject
        });

        code = replaceHTMLTagScriptRet.code;
        mainList = replaceHTMLTagScriptRet.mainList;
    }

    // 恢复 coolie group
    dato.each(preMap[0], function (key, val) {
        code = code.replace(key, val);
    });
    if (options.replaceHTMLCoolieGroup) {
        var replaceHTMLCoolieGroupRet = replaceHTMLCoolieGroup(file, {
            code: code,
            destJSDirname: options.destJSDirname,
            cleanCSSOptions: options.cleanCSSOptions,
            versionLength: options.versionLength,
            srcDirname: options.srcDirname,
            destDirname: options.destDirname,
            destHost: options.destHost,
            destResourceDirname: options.destResourceDirname,
            destCSSDirname: options.destCSSDirname,
            minifyJS: options.minifyJS,
            uglifyJSOptions: options.uglifyJSOptions,
            minifyCSS: options.minifyCSS,
            replaceCSSResource: options.replaceCSSResource,
            signJS: options.signJS,
            signCSS: options.signCSS
        });

        code = replaceHTMLCoolieGroupRet.code;
        jsList = replaceHTMLCoolieGroupRet.jsList;
        cssList = replaceHTMLCoolieGroupRet.cssList;
    }

    if (options.replaceHTMLTagStyleResource) {
        code = replaceHTMLTagStyleResource(file, {
            code: code,
            versionLength: options.versionLength,
            srcDirname: options.srcDirname,
            destDirname: options.destDirname,
            destHost: options.destHost,
            destResourceDirname: options.destResourceDirname,
            minifyCSS: options.minifyCSS,
            minifyResource: options.minifyResource
        });
    }

    if (options.replaceHTMLAttrStyleResource) {
        code = replaceHTMLAttrStyleResource(file, {
            code: code,
            versionLength: options.versionLength,
            srcDirname: options.srcDirname,
            destDirname: options.destDirname,
            destHost: options.destHost,
            destResourceDirname: options.destResourceDirname,
            minifyResource: options.minifyResource
        });
    }

    if (options.signHTML) {
        code = code + sign('html');
    }

    return {
        code: code,
        mainList: mainList,
        jsList: jsList,
        cssList: cssList
    };
};


/**
 * 生成随机唯一 KEY
 * @returns {string}
 * @private
 */
function _generateKey() {
    return 'å' + random.string(10, 'aA0') + random.guid() + 'å';
}



