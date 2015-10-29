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

/**
 * html 构建
 * @param options {Object} 配置
 * @param options.srcDirname {String} 原始目录
 * @param options.destDirname {String} 目标目录
 * @param options.glob {String|Array} 文件
 * @param options.versionLength {Number} 版本号长度
 * @param options.destHost {String} 目标域
 * @param options.destResourceDirname {String} 目标资源路径
 * @param options.minifyJS {Boolean} 是否压缩 JS
 * @param options.minifyCSS {Boolean} 是否压缩 JS
 * @param options.minifyResource {Boolean} 是否压缩资源
 * @param options.srcCoolieConfigBaseDirname {String} 原始 coolie-config.js:base 目录
 * @param options.destCoolieConfigJSPath {String} 目标 coolie-config.js 目录
 * @param options.destCoolieConfigJSPath {String} 目标 coolie-config.js 目录
 * @param [options.uglifyJSOptions=null] {Boolean} 压缩 JS 配置
 * @param [options.cleanCSSOptions=null] {Boolean} 压缩 CSS 配置
 * @param [options.replaceCSSResource=true] {Boolean} 是否替换 css 引用资源
 * @param [options.mainVersionMap] {Object} 入口模块版本信息
 */
module.exports = function (options) {
    // 1. 找出 html
    var htmlFiles = glob({
        glob: options.glob,
        srcDirname: options.srcDirname
    });

    // 2. 压缩 html
    var htmlMap = {};
    dato.each(htmlFiles, function (index, htmlFile) {
        var code = minifyHTML(htmlFile, {
            replaceHTMLAttrResource: true,
            replaceHTMLTagScript: true,
            replaceHTMLTagStyleResource: true,
            replaceHTMLAttrStyleResource: true,
            replaceHTMLCoolieGroup: true,
            removeHTMLYUIComments: true,
            removeHTMLLineComments: true,
            joinHTMLSpaces: true,
            removeHTMLBreakLines: true,
            versionLength: options.versionLength,
            srcDirname: options.srcDirname,
            destDirname: options.destDirname,
            destHost: options.destHost,
            destResourceDirname: options.destResourceDirname,
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

        htmlMap[htmlFile] = new Buffer(code, 'utf8');
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



