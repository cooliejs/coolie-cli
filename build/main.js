/**
 * 构建入口模块
 * @author ydr.me
 * @create 2015-10-26 15:33
 */


'use strict';

var dato = require('ydr-utils').dato;
var debug = require('ydr-utils').debug;

var pathURI = require('../utils/path-uri.js');
var buildModule = require('./module.js');

var defaults = {
    inType: 'js',
    outType: 'js',
    async: false,
    chunk: false,
    main: null,
    uglifyJSOptions: null,
    srcDirname: null,
    destDirname: null,
    destResourceDirname: null,
    destHost: '/',
    versionLength: 32,
    minifyResource: true,
    cleanCSSOptions: null
};

/**
 * 构建入口模块
 * @param file {String} 入口路径
 * @param options {Object} 配置
 * @param options.inType {String} 模块入口类型
 * @param options.outType {String} 模块出口类型
 * @param options.async {Boolean} 是否为异步模块
 * @param options.chunk {Boolean} 是否为异步模块
 * @param options.uglifyJSOptions {Object} uglify-js 配置
 * @param options.srcDirname {String} 原始目录
 * @param options.destDirname {String} 目标目录
 * @param options.destResourceDirname {String} 目标资源目录
 * @param options.destHost {String} 目标域
 * @param options.versionLength {Number} 版本号长度
 * @param options.minifyResource {Boolean} 是否压缩资源
 * @param options.cleanCSSOptions {Object} clean-css 配置
 */
module.exports = function (file, options) {
    options = dato.extend({}, defaults, options);
    var mainFile = file;
    // 依赖长度
    var dependencyLength = 1;
    // 构建长度
    var buildLength = 0;
    var buildMap = {};
    var build = function (file, options) {
        var ret = buildModule(file, {
            inType: options.inType,
            outType: options.outType,
            async: options.async,
            chunk: options.chunk,
            main: mainFile,
            uglifyJSOptions: options.uglifyJSOptions,
            srcDirname: options.srcDirname,
            destDirname: options.destDirname,
            destResourceDirname: options.destResourceDirname,
            destHost: options.destHost,
            versionLength: options.versionLength,
            minifyResource: options.minifyResource,
            cleanCSSOptions: options.cleanCSSOptions
        });

        buildLength++;

        if (ret.dependencies.length) {
            dato.each(ret.dependencies, function (index, dependency) {
                if (buildMap[dependency.id]) {
                    return;
                }

                buildMap[dependency.id] = true;
                dependencyLength++;
                var options2 = dato.extend({}, options, {
                    inType: dependency.inType,
                    outType: dependency.outType
                });
                build(dependency.id, options2);
            });
        }

        var mainURI = pathURI.toRootURL(mainFile, options.srcDirname);

        if(buildLength === dependencyLength){
            debug.success('√', mainURI);
        }
    };

    build(mainFile, options);
};


