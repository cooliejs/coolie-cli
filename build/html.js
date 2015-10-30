/**
 * html 构建
 * @author ydr.me
 * @create 2015-10-28 17:04
 */


'use strict';

var dato = require('ydr-utils').dato;
var path = require('ydr-utils').path;
var debug = require('ydr-utils').debug;
var fse = require('fs-extra');


var minifyHTML = require('../minify/html.js');
var glob = require('../utils/glob.js');
var pathURI = require('../utils/path-uri.js');
var reader = require('../utils/reader.js');
var hook = require('../utils/hook.js');

var defaults = {
    glob: [],
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
    mainVersionMap: null
};

/**
 * html 构建
 * @param options {Object} 配置
 * @param options.glob {String|Array} html glob
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
 * @returns {Array}
 */
module.exports = function (options) {
    options = dato.extend({}, defaults, options);

    // 1. 找出 html
    var htmlFiles = glob({
        glob: options.glob,
        srcDirname: options.srcDirname
    });

    // 2. 压缩 html
    var htmlMap = {};
    dato.each(htmlFiles, function (index, htmlFile) {
        var code = reader(htmlFile, 'utf8');
        var hookRet = hook.exec('beforeReplaceHTML', htmlFile, code);

        if (hookRet !== false) {
            code = hookRet;
        }

        var ret = minifyHTML(htmlFile, {
            code: code,
            replaceHTMLAttrResource: true,
            replaceHTMLTagScript: true,
            replaceHTMLTagStyleResource: true,
            replaceHTMLAttrStyleResource: true,
            replaceHTMLCoolieGroup: true,
            removeHTMLYUIComments: options.removeHTMLYUIComments,
            removeHTMLLineComments: options.removeHTMLLineComments,
            joinHTMLSpaces: options.joinHTMLSpaces,
            removeHTMLBreakLines: options.removeHTMLBreakLines,
            versionLength: options.versionLength,
            srcDirname: options.srcDirname,
            destDirname: options.destDirname,
            destJSDirname: options.destJSDirname,
            destCSSDirname: options.destCSSDirname,
            destResourceDirname: options.destResourceDirname,
            destHost: options.destHost,
            srcCoolieConfigBaseDirname: options.srcCoolieConfigBaseDirname,
            destCoolieConfigJSPath: options.destCoolieConfigJSPath,
            minifyJS: options.minifyJS,
            minifyCSS: options.minifyCSS,
            minifyResource: options.minifyResource,
            uglifyJSOptions: options.uglifyJSOptions,
            cleanCSSOptions: options.cleanCSSOptions,
            replaceCSSResource: options.replaceCSSResource,
            mainVersionMap: options.mainVersionMap
        });

        htmlMap[htmlFile] = new Buffer(ret, 'utf8');
    });

    // 3. 生成 html
    dato.each(htmlMap, function (file, buffer) {
        var relative = path.relative(options.srcDirname, file);
        var htmlURI = pathURI.toRootURL(file, options.srcDirname);
        var destFile = path.join(options.destDirname, relative);

        try {
            fse.outputFileSync(destFile, buffer);
            debug.success('√', htmlURI);
        } catch (err) {
            debug.error('write html', path.toSystem(file));
            debug.error('write file', err.message);
            return process.exit(1);
        }
    });

    return htmlFiles;
};



