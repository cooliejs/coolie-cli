/**
 * 构建入口模块
 * @author ydr.me
 * @create 2015-10-26 15:33
 */


'use strict';

var dato = require('ydr-utils').dato;
var debug = require('ydr-utils').debug;
var encryption = require('ydr-utils').encryption;
var path = require('ydr-utils').path;
var fse = require('fs-extra');

var pathURI = require('../utils/path-uri.js');
var replaceAMDRequire = require('../replace/amd-require.js');
var buildModule = require('./module.js');

var defaults = {
    async: false,
    main: null,
    srcDirname: null,
    destDirname: null,
    destJSDirname: null,
    destCSSDirname: null,
    destResourceDirname: null,
    destHost: '/',
    versionLength: 32,
    minifyResource: true,
    uglifyJSOptions: null,
    cleanCSSOptions: null,
    removeHTMLYUIComments: true,
    removeHTMLLineComments: true,
    joinHTMLSpaces: true,
    removeHTMLBreakLines: true
};

/**
 * 构建入口模块
 * @param file {String} 入口路径
 * @param options {Object} 配置
 * @param options.async {Boolean} 是否为异步模块
 * @param options.srcDirname {String} 原始目录
 * @param options.destDirname {String} 目标目录
 * @param options.destJSDirname {String} 目标 JS 目录
 * @param options.destCSSDirname {String} 目标 CSS 目录
 * @param options.destResourceDirname {String} 目标资源目录
 * @param options.destHost {String} 目标域
 * @param options.versionLength {Number} 版本号长度
 * @param options.asyncName2IdMap {Object} async 模块版本号配置 {name: id}
 * @param options.minifyResource {Boolean} 是否压缩资源
 * @param options.uglifyJSOptions {Object} uglify-js 配置
 * @param options.cleanCSSOptions {Object} clean-css 配置
 * @param [options.removeHTMLYUIComments=true] {Boolean} 是否去除 YUI 注释
 * @param [options.removeHTMLLineComments=true] {Boolean} 是否去除行注释
 * @param [options.joinHTMLSpaces=true] {Boolean} 是否合并空白
 * @param [options.removeHTMLBreakLines=true] {Boolean} 是否删除断行
 * @returns {[{id: String, file: String, buffer: Buffer, md5: String}]}
 */
module.exports = function (file, options) {
    options = dato.extend({}, defaults, options);
    var mainFile = file;
    // 依赖长度
    var dependencyLength = 1;
    // 构建长度
    var buildLength = 0;
    var buildMap = {};
    var dependencies = [];
    var build = function (file, options) {
        var ret = buildModule(file, {
            inType: options.inType,
            outType: options.outType,
            async: options.async,
            main: mainFile,
            isMain: options.isMain,
            uglifyJSOptions: options.uglifyJSOptions,
            srcDirname: options.srcDirname,
            destDirname: options.destDirname,
            destResourceDirname: options.destResourceDirname,
            destHost: options.destHost,
            versionLength: options.versionLength,
            minifyResource: options.minifyResource,
            cleanCSSOptions: options.cleanCSSOptions
        });

        // 异步模块，先替换 require.async
        if (options.async && options.isMain) {
            //ret.code = replaceAMDRequire(file, {
            //    code: ret.code,
            //    name2IdMap: options.asyncName2IdMap,
            //    async: true
            //});
        }

        dependencies.push({
            id: file + '|' + options.outType,
            file: file,
            buffer: new Buffer('\n' + ret.code, 'utf8'),
            md5: ret.md5
        });

        if (ret.dependencies.length) {
            dato.each(ret.dependencies, function (index, dependency) {
                if (buildMap[dependency.id]) {
                    return;
                }

                buildMap[dependency.id] = true;
                dependencyLength++;
                var options3 = dato.extend({}, options, {
                    inType: dependency.inType,
                    outType: dependency.outType,
                    isMain: false,
                    async: false
                });
                build(dependency.file, options3);
            });
        }

        buildLength++;

        if (buildLength === dependencyLength) {
            var srcMainURI = pathURI.toRootURL(mainFile, options.srcDirname);

            debug.success('√', srcMainURI);
        }
    };
    var options2 = dato.extend({}, options, {
        inType: 'js',
        outType: 'js',
        isMain: true
    });

    build(mainFile, options2);

    return dependencies;
};


