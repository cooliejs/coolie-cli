/**
 * html 压缩
 * @author ydr.me
 * @create 2015-10-22 16:16
 */


'use strict';


var debug = require('ydr-utils').debug;
var dato = require('ydr-utils').dato;
var random = require('ydr-utils').random;

var sign = require('../utils/sign.js');

// 替换 <img src="">
var replaceHTMLAttrResource = require('../replace/html-attr-resource.js');
// 替换 <script src>
var replaceHTMLTagScriptAttr = require('../replace/html-tag-script-attr.js');
var replaceHTMLTagScriptCoolie = require('../replace/html-tag-script-coolie.js');
var replaceHTMLTagScriptContent = require('../replace/html-tag-script-content.js');
// 替换 <script>
var replaceHTMLTagLink = require('../replace/html-tag-link.js');
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
var REG_COOLIE_COMMENTS = /<!--\s*?coolie\s*?-->[\s\S]*?<!--\s*?\/coolie\s*?-->/gi;
var REG_PRE_TAGNAME = /<(textarea|pre|code|style|script)\b[\s\S]*?>[\s\S]*?<\/\1>/gi;
var REG_CONDITIONS_COMMENTS = /<!--\[(if|else if).*?]>([\s\S]*?)<!\[endif]-->/gi;

var defaults = {
    code: '',
    replaceHTMLAttrResource: false,
    replaceHTMLTagScriptCoolie: false,
    replaceHTMLTagScriptContent: false,
    replaceHTMLTagScriptAttr: false,
    replaceHTMLTagLink: false,
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
 * @param [options.replaceHTMLTagScriptCoolie=false] {Boolean} 是否替换 html 内的 <script> 的 coolie
 * @param [options.replaceHTMLTagScriptAttr=false] {Boolean} 是否替换 html 内的 <script> 的 src
 * @param [options.replaceHTMLTagScriptContent=false] {Boolean} 是否替换 html 内的 <script> 的内容
 * @param [options.replaceHTMLTagLink=false] {Boolean} 是否替换 html 内的 <link>
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
 * @param [options.coolieConfigBase] {String} coolie-config:base 值
 * @param [options.srcCoolieConfigJSPath] {String} 原始 coolie-config.js 路径
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
    var coolieMap = {};
    var preMap = {};
    var commentsMap = {};
    var code = options.code;
    var mainList = [];
    var jsList = [];
    var cssList = [];
    var resList = [];
    var replace = function (pack) {
        return function (source) {
            var key = _generateKey();

            pack[key] = source;

            return key;
        };
    };

    // 保留 <!--coolie-->
    code = code.replace(REG_COOLIE_COMMENTS, replace(coolieMap));

    // 保留条件注释
    code = code.replace(REG_CONDITIONS_COMMENTS, replace(preMap));

    if (options.removeHTMLLineComments) {
        code = code.replace(REG_LINE_COMMENTS, '');
    } else {
        code = code.replace(REG_LINE_COMMENTS, replace(commentsMap));
    }

    if (options.removeHTMLYUIComments) {
        code = code.replace(REG_YUI_COMMENTS, '');
    } else {
        code = code.replace(REG_YUI_COMMENTS, replace(commentsMap));
    }

    // 保留 pre tagName
    code = code.replace(REG_PRE_TAGNAME, replace(preMap));

    if (options.joinHTMLSpaces) {
        code = code.replace(REG_SPACES, ' ');
    }

    if (options.removeHTMLBreakLines) {
        code = code.replace(REG_LINES, '');
    }

    // 恢复 条件注释 和 pre tagName
    dato.each(preMap, function (key, val) {
        code = code.replace(key, val);
    });

    if (options.replaceHTMLAttrResource) {
        var replaceHTMLAttrResourceRet = replaceHTMLAttrResource(file, {
            code: code,
            versionLength: options.versionLength,
            srcDirname: options.srcDirname,
            destDirname: options.destDirname,
            destHost: options.destHost,
            destResourceDirname: options.destResourceDirname,
            minifyResource: options.minifyResource
        });

        code = replaceHTMLAttrResourceRet.code;
        resList = resList.concat(replaceHTMLAttrResourceRet.resList);
    }

    if (options.replaceHTMLTagScriptCoolie) {
        var replaceHTMLTagScriptCoolieRet = replaceHTMLTagScriptCoolie(file, {
            code: code,
            srcDirname: options.srcDirname,
            coolieConfigBase: options.coolieConfigBase,
            srcCoolieConfigJSPath: options.srcCoolieConfigJSPath,
            srcCoolieConfigBaseDirname: options.srcCoolieConfigBaseDirname,
            destDirname: options.destDirname,
            destHost: options.destHost,
            destJSDirname: options.destJSDirname,
            destCoolieConfigJSPath: options.destCoolieConfigJSPath,
            versionLength: options.versionLength,
            mainVersionMap: options.mainVersionMap,
            minifyJS: options.minifyJS,
            signJS: options.signJS
        });

        code = replaceHTMLTagScriptCoolieRet.code;
        mainList = replaceHTMLTagScriptCoolieRet.mainList;
        jsList = jsList.concat(replaceHTMLTagScriptCoolieRet.jsList);
    }

    if (options.replaceHTMLTagScriptAttr) {
        var replaceHTMLTagScriptAttrRet = replaceHTMLTagScriptAttr(file, {
            code: code,
            srcDirname: options.srcDirname,
            coolieConfigBase: options.coolieConfigBase,
            srcCoolieConfigJSPath: options.srcCoolieConfigJSPath,
            srcCoolieConfigBaseDirname: options.srcCoolieConfigBaseDirname,
            destDirname: options.destDirname,
            destHost: options.destHost,
            destJSDirname: options.destJSDirname,
            destCoolieConfigJSPath: options.destCoolieConfigJSPath,
            versionLength: options.versionLength,
            mainVersionMap: options.mainVersionMap,
            minifyJS: options.minifyJS,
            signJS: options.signJS
        });

        code = replaceHTMLTagScriptAttrRet.code;
        jsList = jsList.concat(replaceHTMLTagScriptAttrRet.jsList);
    }

    if (options.replaceHTMLTagScriptContent) {
        var replaceHTMLTagScriptContentRet = replaceHTMLTagScriptContent(file, {
            code: code,
            srcDirname: options.srcDirname,
            coolieConfigBase: options.coolieConfigBase,
            srcCoolieConfigJSPath: options.srcCoolieConfigJSPath,
            srcCoolieConfigBaseDirname: options.srcCoolieConfigBaseDirname,
            destDirname: options.destDirname,
            destHost: options.destHost,
            destJSDirname: options.destJSDirname,
            destCoolieConfigJSPath: options.destCoolieConfigJSPath,
            versionLength: options.versionLength,
            mainVersionMap: options.mainVersionMap,
            minifyJS: options.minifyJS,
            signJS: options.signJS
        });

        code = replaceHTMLTagScriptContentRet.code;
        jsList = jsList.concat(replaceHTMLTagScriptContentRet.jsList);
    }

    if (options.replaceHTMLTagLink) {
        var replaceHTMLTagLinkRet = replaceHTMLTagLink(file, {
            code: code,
            srcDirname: options.srcDirname,
            destDirname: options.destDirname,
            destHost: options.destHost,
            destCSSDirname: options.destCSSDirname,
            destResourceDirname: options.destResourceDirname,
            versionLength: options.versionLength,
            minifyCSS: options.minifyCSS,
            cleanCSSOptions: options.cleanCSSOptions,
            signCSS: options.signCSS
        });

        code = replaceHTMLTagLinkRet.code;
        cssList = cssList.concat(replaceHTMLTagLinkRet.cssList);
    }

    // 恢复 coolie group
    dato.each(coolieMap, function (key, val) {
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
        jsList = jsList.concat(replaceHTMLCoolieGroupRet.jsList);
        cssList = cssList.concat(replaceHTMLCoolieGroupRet.cssList);
    }

    if (options.replaceHTMLTagStyleResource) {
        var replaceHTMLTagStyleResourceRet = replaceHTMLTagStyleResource(file, {
            code: code,
            versionLength: options.versionLength,
            srcDirname: options.srcDirname,
            destDirname: options.destDirname,
            destHost: options.destHost,
            destResourceDirname: options.destResourceDirname,
            minifyCSS: options.minifyCSS,
            minifyResource: options.minifyResource
        });

        code = replaceHTMLTagStyleResourceRet.code;
        resList = resList.concat(replaceHTMLTagStyleResourceRet.resList);
    }

    if (options.replaceHTMLAttrStyleResource) {
        var replaceHTMLAttrStyleResourceRet = replaceHTMLAttrStyleResource(file, {
            code: code,
            versionLength: options.versionLength,
            srcDirname: options.srcDirname,
            destDirname: options.destDirname,
            destHost: options.destHost,
            destResourceDirname: options.destResourceDirname,
            minifyResource: options.minifyResource
        });
        code = replaceHTMLAttrStyleResourceRet.code;
        resList = resList.concat(replaceHTMLAttrStyleResourceRet.resList);
    }

    // 恢复注释
    dato.each(commentsMap, function (key, val) {
        code = code.replace(key, val);
    });

    if (options.signHTML) {
        code = code + '\n' + sign('html');
    }

    return {
        code: code,
        mainList: mainList,
        jsList: jsList,
        cssList: cssList,
        resList: resList
    };
};


/**
 * 生成随机唯一 KEY
 * @returns {string}
 * @private
 */
function _generateKey() {
    return '≤' + random.string(10, 'aA0') + random.guid() + '≥';
}



