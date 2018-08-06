/**
 * html 压缩
 * @author ydr.me
 * @create 2015-10-22 16:16
 */


'use strict';


var object = require('blear.utils.object');
var random = require('blear.utils.random');
var console = require('blear.node.console');
var collection = require('blear.utils.collection');


var sign = require('../utils/sign.js');

// 替换 <img src="">
var replaceHTMLAttrResource = require('../replace/html-attr-resource.js');
// 替换 <script src>
var replaceHTMLTagScriptAttr = require('../replace/html-tag-script-attr.js');
var replaceHTMLTagScriptCoolie = require('../replace/html-tag-script-coolie.js');
var replaceHTMLTagScriptContent = require('../replace/html-tag-script-content.js');
// 替换 <link>
var replaceHTMLTagLink = require('../replace/html-tag-link.js');
// 替换 <style>
var replaceHTMLTagStyleResource = require('../replace/html-tag-style-resource.js');
// 替换 <div style=""
var replaceHTMLAttrStyleResource = require('../replace/html-attr-style-resource.js');
// 替换 <!--coolie-->...<!--/coolie-->
var replaceHTMLCoolieGroup = require('../replace/html-coolie-group.js');

var reLineBreak = /[\n\r]/g;
var reContinuousBlanks = /\s{2,}|\t/g;
// 单行注释
var reOneLineComments = /<!--.*?-->/g;
// 多行注释
var reMultipleLinesComments = /<!--.*\n(.*\n)+?.*-->/g;
var reCoolieComments = /<!--\s*?coolie\s*?-->[\s\S]*?<!--\s*?\/coolie\s*?-->/gi;
var rePreTagname = /<(textarea|pre|code|style|script)\b[\s\S]*?>[\s\S]*?<\/\1>/gi;
var reConditionsCommentsStarts = [
    /<!--\[(if|else if|else).*]><!-->/gi,
    /<!--\[(if|else if|else).*]>/gi
];
var reConditionsCommentsEnds = [
    /<!--<!\[endif]-->/gi,
    /<!\[endif]-->/gi
];
var reConditionsComments = /<!--\[(if|else if).*?]>([\s\S]*?)<!\[endif]-->/gi;
var defaults = {
    code: '',
    versionLength: 32,
    srcDirname: null,
    destDirname: null,
    destJSDirname: null,
    destCSSDirname: null,
    destResourceDirname: null,
    destHost: '/',
    srcCoolieConfigMainModulesDirname: null,
    destCoolieConfigJSPath: null,
    minifyJS: true,
    minifyCSS: true,
    minifyResource: true,
    uglifyJSOptions: null,
    cleanCSSOptions: null,
    htmlMinifyOptions: null,
    replaceCSSResource: true,
    mainVersionMap: null,
    signHTML: false,
    signJS: false,
    signCSS: false,
    mute: false,
    progressKey: null
};
var htmlMinifyDefaults = {
    removeHTMLOneLineComments: true,
    removeHTMLMultipleLinesComments: true,
    joinHTMLContinuousBlanks: true,
    removeHTMLBreakLines: true
};

/**
 * html minify
 * @param file {String} 文件地址
 * @param options {Object} 配置
 * @param options.code {String} 代码
 * @param options.htmlMinifyOptions {Object} 压缩 html 配置
 * @param [options.versionLength=32] {Number} 版本号长度
 * @param [options.srcDirname] {String} 原始根目录
 * @param [options.destDirname] {String} 目标根目录
 * @param [options.destJSDirname] {String} 目标 JS 目录
 * @param [options.destCSSDirname] {String} 目标 CSS 目录
 * @param [options.destResourceDirname] {String} 目标资源目录
 * @param [options.destHost] {String} 目标域
 * @param [options.coolieConfigMainModulesDir] {String} coolie-config:base 值
 * @param [options.srcCoolieConfigJSPath] {String} 原始 coolie-config.js 路径
 * @param [options.srcCoolieConfigMainModulesDirname] {String} 原始 coolie-config:base 目录
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
 * @param [options.mute] {Boolean} 是否静音
 * @param [options.progressKey] {String} 日期键
 * @param [options.middleware] {Object} 中间件
 * @returns {Object}
 */
var minifyHTML = function (file, options) {
    options = object.assign({}, defaults, options);
    var htmlMinifyOptions = object.assign({}, htmlMinifyDefaults, options.htmlMinifyOptions);
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
            var matchConditionsCommentsRet = matchConditionsComments(file, options, source);

            if (!matchConditionsCommentsRet.start || !matchConditionsCommentsRet.end) {
                // 防止正则标记符影响原内容
                pack[key] = source.replace(/\$/g, '$$$$');
                return key;
            }

            var minifyConditionsCommentsRet = minifyConditionsComments(file, options, matchConditionsCommentsRet);

            pack[key] = minifyConditionsCommentsRet.code;
            mainList = mainList.concat(minifyConditionsCommentsRet.mainList);
            jsList = jsList.concat(minifyConditionsCommentsRet.jsList);
            cssList = cssList.concat(minifyConditionsCommentsRet.cssList);
            resList = resList.concat(minifyConditionsCommentsRet.resList);

            return key;
        };
    };

    // 保留 <!--coolie-->
    code = code.replace(reCoolieComments, replace(coolieMap));

    // 保留条件注释
    code = code.replace(reConditionsComments, replace(commentsMap));

    // 移除单行注释
    if (htmlMinifyOptions.removeHTMLOneLineComments) {
        code = code.replace(reOneLineComments, '');
    } else {
        code = code.replace(reOneLineComments, replace(commentsMap));
    }

    // 移除多行注释
    if (htmlMinifyOptions.removeHTMLMultipleLinesComments) {
        code = code.replace(reMultipleLinesComments, '');
    } else {
        code = code.replace(reMultipleLinesComments, replace(commentsMap));
    }

    // 保留 pre tagName
    code = code.replace(rePreTagname, replace(preMap));

    // 合并长空白
    if (htmlMinifyOptions.joinHTMLContinuousBlanks) {
        code = code.replace(reContinuousBlanks, ' ');
    }

    // 移除多换行
    if (htmlMinifyOptions.removeHTMLBreakLines) {
        code = code.replace(reLineBreak, '');
    }

    // 恢复 pre tagName
    collection.each(preMap, function (key, val) {
        code = code.replace(key, val);
    });


    // replace <img src="...">
    var replaceHTMLAttrResourceRet = replaceHTMLAttrResource(file, {
        code: code,
        versionLength: options.versionLength,
        srcDirname: options.srcDirname,
        destDirname: options.destDirname,
        destHost: options.destHost,
        destResourceDirname: options.destResourceDirname,
        minifyResource: options.minifyResource,
        mute: options.mute,
        progressKey: options.progressKey,
        middleware: options.middleware
    });

    code = replaceHTMLAttrResourceRet.code;
    resList = resList.concat(replaceHTMLAttrResourceRet.resList);

    // replace <script coolie>
    var replaceHTMLTagScriptCoolieRet = replaceHTMLTagScriptCoolie(file, {
        code: code,
        srcDirname: options.srcDirname,
        coolieConfigMainModulesDir: options.coolieConfigMainModulesDir,
        srcCoolieConfigJSPath: options.srcCoolieConfigJSPath,
        srcCoolieConfigMainModulesDirname: options.srcCoolieConfigMainModulesDirname,
        destDirname: options.destDirname,
        destHost: options.destHost,
        destJSDirname: options.destJSDirname,
        destCoolieConfigJSPath: options.destCoolieConfigJSPath,
        versionLength: options.versionLength,
        mainVersionMap: options.mainVersionMap,
        minifyJS: options.minifyJS,
        uglifyJSOptions: options.uglifyJSOptions,
        signJS: options.signJS,
        mute: options.mute,
        progressKey: options.progressKey,
        middleware: options.middleware
    });

    code = replaceHTMLTagScriptCoolieRet.code;
    mainList = mainList.concat(replaceHTMLTagScriptCoolieRet.mainList);
    jsList = jsList.concat(replaceHTMLTagScriptCoolieRet.jsList);


    // replace <script>
    var replaceHTMLTagScriptAttrRet = replaceHTMLTagScriptAttr(file, {
        code: code,
        srcDirname: options.srcDirname,
        destDirname: options.destDirname,
        destHost: options.destHost,
        destJSDirname: options.destJSDirname,
        versionLength: options.versionLength,
        mainVersionMap: options.mainVersionMap,
        minifyJS: options.minifyJS,
        uglifyJSOptions: options.uglifyJSOptions,
        signJS: options.signJS,
        mute: options.mute,
        progressKey: options.progressKey,
        middleware: options.middleware
    });

    code = replaceHTMLTagScriptAttrRet.code;
    jsList = jsList.concat(replaceHTMLTagScriptAttrRet.jsList);


    // replace <script>***</script>
    var replaceHTMLTagScriptContentRet = replaceHTMLTagScriptContent(file, {
        code: code,
        srcDirname: options.srcDirname,
        minifyJS: options.minifyJS,
        uglifyJSOptions: options.uglifyJSOptions,
        signJS: options.signJS,
        mute: options.mute,
        progressKey: options.progressKey,
        middleware: options.middleware
    });

    code = replaceHTMLTagScriptContentRet.code;
    jsList = jsList.concat(replaceHTMLTagScriptContentRet.jsList);


    // replace <link href="">
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
        signCSS: options.signCSS,
        mute: options.mute,
        progressKey: options.progressKey,
        middleware: options.middleware
    });

    code = replaceHTMLTagLinkRet.code;
    cssList = cssList.concat(replaceHTMLTagLinkRet.cssList);


    // 恢复 coolie group
    collection.each(coolieMap, function (key, val) {
        code = code.replace(key, val);
    });


    // replace <!--coolie--> ... <!--/coolie-->
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
        signCSS: options.signCSS,
        mute: options.mute,
        progressKey: options.progressKey,
        middleware: options.middleware
    });

    code = replaceHTMLCoolieGroupRet.code;
    jsList = jsList.concat(replaceHTMLCoolieGroupRet.jsList);
    cssList = cssList.concat(replaceHTMLCoolieGroupRet.cssList);


    // replace <style>
    var replaceHTMLTagStyleResourceRet = replaceHTMLTagStyleResource(file, {
        code: code,
        versionLength: options.versionLength,
        srcDirname: options.srcDirname,
        destDirname: options.destDirname,
        destHost: options.destHost,
        destResourceDirname: options.destResourceDirname,
        minifyCSS: options.minifyCSS,
        cleanCSSOptions: options.cleanCSSOptions,
        minifyResource: options.minifyResource,
        mute: options.mute,
        progressKey: options.progressKey,
        middleware: options.middleware
    });

    code = replaceHTMLTagStyleResourceRet.code;
    resList = resList.concat(replaceHTMLTagStyleResourceRet.resList);


    // replace <div style="">
    var replaceHTMLAttrStyleResourceRet = replaceHTMLAttrStyleResource(file, {
        code: code,
        versionLength: options.versionLength,
        srcDirname: options.srcDirname,
        destDirname: options.destDirname,
        destHost: options.destHost,
        destResourceDirname: options.destResourceDirname,
        minifyResource: options.minifyResource,
        mute: options.mute,
        progressKey: options.progressKey,
        middleware: options.middleware
    });
    code = replaceHTMLAttrStyleResourceRet.code;
    resList = resList.concat(replaceHTMLAttrStyleResourceRet.resList);


    // 恢复注释
    collection.each(commentsMap, function (key, val) {
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
 * 匹配条件注释
 * @param file
 * @param options
 * @param source
 * @returns {{start: string, end: string, source: *}}
 */
var matchConditionsComments = function (file, options, source) {
    var start = '';
    collection.each(reConditionsCommentsStarts, function (index, reg) {
        start = (source.match(reg) || [''])[0];

        if (start) {
            source = source.replace(reg, '');
            return false;
        }

    });

    var end = '';
    collection.each(reConditionsCommentsEnds, function (index, reg) {
        end = (source.match(reg) || [''])[0];

        if (end) {
            source = source.replace(reg, '');
            return false;
        }
    });

    return {
        start: start,
        end: end,
        source: source
    };
};


/**
 * 压缩注释的 html
 * @param file
 * @param options
 * @param matched
 * @returns {*}
 */
function minifyConditionsComments(file, options, matched) {
    var source = matched.source;
    var start = matched.start;
    var end = matched.end;
    var options2 = object.assign({}, options);

    options2.code = source;
    options2.signHTML = false;
    //code: code,
    //mainList: mainList,
    //jsList: jsList,
    //cssList: cssList,
    //resList: resList
    var realRet = minifyHTML(file, options2);
    realRet.code = start + realRet.code + end;
    return realRet;
}


/**
 * 生成随机唯一 KEY
 * @returns {string}
 * @private
 */
function _generateKey() {
    return '≤' + random.string(10, 'aA0') + random.guid() + '≥';
}


module.exports = minifyHTML;
