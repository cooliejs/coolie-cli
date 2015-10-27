/**
 * 遍历构建入口
 * @author ydr.me
 * @create 2015-10-27 11:25
 */


'use strict';

var debug = require('ydr-utils').debug;
var dato = require('ydr-utils').dato;

var parseMain = require('../parse/main.js');
var buildMain = require('./main.js');

var defaults = {
    main: [],
    chunk: [],
    srcDirname: null,
    destDirname: null,
    destResourceDirname: null,
    destHost: '/',
    globOptions: {
        dot: false,
        nodir: true
    },
    uglifyJSOptions: null,
    versionLength: 32,
    minifyResource: true,
    destCoolieConfigBaseDirname: null
};

/**
 * 遍历构建入口
 * @param options {Object} 配置
 * @param options.main {String|Array} main 配置
 * @param options.chunk {String|Array} chunk 配置
 * @param options.srcDirname {String} 原始目录
 * @param options.destDirname {String} 目标目录
 * @param options.destResourceDirname {String} 目标资源目录
 * @param options.destHost {String} 目标域
 * @param options.globOptions {Object} glob 配置
 * @param options.uglifyJSOptions {Object} uglify-js 配置
 * @param options.versionLength {Number} 版本号长度
 * @param options.minifyResource {Boolean} 是否压缩资源
 * @param options.cleanCSSOptions {Object} clean-css 配置
 * @param options.destCoolieConfigBaseDirname {String} coolie-config:base 目录
 */
module.exports = function (options) {
    options = dato.extend(true, {}, defaults, options);
    var mainAsyncMap = parseMain({
        main: options.main,
        srcDirname: options.srcDirname,
        globOptions: options.globOptions
    });

    dato.each(mainAsyncMap, function (mainFile, mainMeta) {
        buildMain(mainFile, {
            async: mainMeta.async,
            chunk: false,
            uglifyJSOptions: options.uglifyJSOptions,
            srcDirname: options.srcDirname,
            destDirname: options.destDirname,
            destResourceDirname: options.destResourceDirname,
            destHost: options.destHost,
            versionLength: options.versionLength,
            minifyResource: options.minifyResource,
            cleanCSSOptions: options.cleanCSSOptions,
            destCoolieConfigBaseDirname: options.destCoolieConfigBaseDirname
        });
    });
};


