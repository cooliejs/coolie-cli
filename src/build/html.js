/**
 * html 构建
 * @author ydr.me
 * @create 2015-10-28 17:04
 */


'use strict';

var object = require('blear.utils.object');
var collection = require('blear.utils.collection');
var path = require('blear.node.path');
var debug = require('blear.node.debug');
var typeis = require('blear.utils.typeis');
var fse = require('fs-extra');
var console = require('blear.node.console');


var minifyHTML = require('../minify/html.js');
var pathURI = require('../utils/path-uri.js');
var reader = require('../utils/reader.js');
var progress = require('../utils/progress.js');

var defaults = {
    middleware: null,
    glob: [],
    htmlMinifyOptions: null,
    versionLength: 32,
    srcDirname: null,
    destDirname: null,
    destJSDirname: null,
    destCSSDirname: null,
    destResourceDirname: null,
    destHost: '/',
    srcCoolieConfigJSPath: null,
    srcCoolieConfigMainModulesDirname: null,
    destCoolieConfigJSPath: null,
    minifyJS: true,
    minifyCSS: true,
    minifyResource: true,
    uglifyJSOptions: null,
    cleanCSSOptions: null,
    replaceCSSResource: true,
    mainVersionMap: null,
    mute: true
};

/**
 * html 构建
 * @param options {Object} 配置
 * @param options.middleware {Object} 中间件
 * @param options.glob {String|Array} html glob
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
 * @param [options.mute] {Boolean} 是否静音，隐藏多余日志的打印
 * @returns {Object}
 */
module.exports = function (options) {
    options = object.assign({}, defaults, options);

    // 1. 找出 html
    var htmlList = path.glob(options.glob, {
        srcDirname: options.srcDirname
    });

    // 2. 压缩 html
    var htmlMainMap = {};
    var htmlJSMap = {};
    var htmlCSSMap = {};
    var htmlRESMap = {};
    var htmlLength = htmlList.length;

    collection.each(htmlList, function (index, htmlFile) {
        var code;

        try {
            code = reader(htmlFile, 'utf8', htmlFile);
        } catch (err) {
            debug.error('build html', path.normalize(htmlFile));
            process.exit(1);
        }

        if (options.middleware) {
            var preRet = options.middleware.exec({
                file: htmlFile,
                progress: 'pre-html',
                code: code
            });

            if (typeis.Object(preRet) && typeis.String(preRet.code)) {
                code = preRet.code;
            }
        }

        var progressKey = (index + 1) + '/' + htmlLength;
        var ret = minifyHTML(htmlFile, {
            code: code,
            htmlMinifyOptions: options.htmlMinifyOptions,
            versionLength: options.versionLength,
            srcDirname: options.srcDirname,
            destDirname: options.destDirname,
            destJSDirname: options.destJSDirname,
            destCSSDirname: options.destCSSDirname,
            destResourceDirname: options.destResourceDirname,
            destHost: options.destHost,
            coolieConfigMainModulesDir: options.coolieConfigMainModulesDir,
            srcCoolieConfigJSPath: options.srcCoolieConfigJSPath,
            srcCoolieConfigMainModulesDirname: options.srcCoolieConfigMainModulesDirname,
            destCoolieConfigJSPath: options.destCoolieConfigJSPath,
            minifyJS: options.minifyJS,
            minifyCSS: options.minifyCSS,
            minifyResource: options.minifyResource,
            uglifyJSOptions: options.uglifyJSOptions,
            cleanCSSOptions: options.cleanCSSOptions,
            replaceCSSResource: options.replaceCSSResource,
            mainVersionMap: options.mainVersionMap,
            signHTML: true,
            signJS: false,
            signCSS: false,
            mute: options.mute,
            progressKey: progressKey
        });

        var relative = path.relative(options.srcDirname, htmlFile);
        var htmlURI = pathURI.toRootURL(htmlFile, options.srcDirname);
        var destFile = path.join(options.destDirname, relative);

        htmlMainMap[htmlFile] = ret.mainList;
        htmlJSMap[htmlFile] = ret.jsList;
        htmlCSSMap[htmlFile] = ret.cssList;
        htmlRESMap[htmlFile] = ret.resList;

        if (options.middleware) {
            var postRet = options.middleware.exec({
                file: htmlFile,
                progress: 'post-html',
                code: ret.code
            });

            if (typeis.Object(postRet) && typeis.String(postRet.code)) {
                ret.code = postRet.code;
            }
        }

        try {
            fse.outputFileSync(destFile, ret.code, 'utf8');
            progress.stop(progressKey, htmlURI);
        } catch (err) {
            debug.error('write html', path.normalize(htmlFile));
            debug.error('write file', err.message);
            return process.exit(1);
        }
    });

    return {
        htmlList: htmlList,
        htmlMainMap: htmlMainMap,
        htmlJSMap: htmlJSMap,
        htmlCSSMap: htmlCSSMap,
        htmlRESMap: htmlRESMap
    };
};



