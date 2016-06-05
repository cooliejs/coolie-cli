/**
 * 构建入口模块
 * @author ydr.me
 * @create 2015-10-26 15:33
 */


'use strict';

var dato = require('ydr-utils').dato;
var debug = require('blear.node.debug');
var path = require('ydr-utils').path;
var controller = require('ydr-utils').controller;

var pathURI = require('../utils/path-uri.js');
var progress = require('../utils/progress.js');
var buildModule = require('./module.js');

var defaults = {
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
    htmlMinifyOptions: null,
    mainIndex: 0,
    mainLength: 0,
    mute: true
};

/**
 * 构建入口模块
 * @param file {String} 入口路径
 * @param options {Object} 配置
 * @param options.srcDirname {String} 原始目录
 * @param options.coolieConfigs {String} coolie-configs.js 配置
 * @param options.srcCoolieConfigMainModulesDirname {String} base 根目录
 * @param options.srcCoolieConfigNodeModulesDirname {String} node_modules 根目录
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
 * @param options.htmlMinifyOptions {Object} 压缩 html 配置
 * @param [options.mute=true] {Boolean} 是否静音
 * @param options.virtualMap {Object} 虚拟
 * @param options.mainIndex {Number} 当前序号
 * @param options.mainLength {Number} 长度
 * @param options.compatible {Boolean} 是否兼容模式
 * @returns {{dependencies: {id: String, file: String, buffer: Buffer, md5: String}, resList: Array}}
 */
module.exports = function (file, options) {
    var mainFile = file;
    var virtualMap = options.virtualMap;
    // 依赖长度
    var dependencyLength = 1;
    // 构建长度
    var buildLength = 0;
    var buildMap = {};
    var dependencies = [];
    var resList = [];
    var resMap = {};
    var build = function (file, options) {
        var srcURI = pathURI.toRootURL(file, options.srcDirname);
        progress.run((options.mainIndex + 1) + '/' + options.mainLength, srcURI);
        var ret = buildModule(file, {
            inType: options.inType,
            outType: options.outType,
            main: mainFile,
            parent: options.parent,
            uglifyJSOptions: options.uglifyJSOptions,
            srcDirname: options.srcDirname,
            coolieConfigs: options.coolieConfigs,
            srcCoolieConfigMainModulesDirname: options.srcCoolieConfigMainModulesDirname,
            srcCoolieConfigNodeModulesDirname: options.srcCoolieConfigNodeModulesDirname,
            destDirname: options.destDirname,
            destJSDirname: options.destJSDirname,
            destCSSDirname: options.destCSSDirname,
            destResourceDirname: options.destResourceDirname,
            destHost: options.destHost,
            versionLength: options.versionLength,
            minifyResource: options.minifyResource,
            cleanCSSOptions: options.cleanCSSOptions,
            virtualMap: options.virtualMap,
            mute: options.mute,
            compatible: options.compatible
        });

        dato.each(ret.resList, function (index, res) {
            if (!resMap[res]) {
                resMap[res] = true;
                resList.push(res);
            }
        });

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
                    file: dependency.file,
                    inType: dependency.inType,
                    outType: dependency.outType,
                    parent: file
                });
                build(dependency.file, options3);
            });
        }

        buildLength++;

        if (buildLength === dependencyLength) {
            var replacedFile = virtualMap[mainFile] || mainFile;
            var srcMainURI = pathURI.toRootURL(replacedFile, options.srcDirname);

            progress.stop((options.mainIndex + 1) + '/' + options.mainLength, srcMainURI);
        }
    };
    var options2 = dato.extend({}, options, {
        file: file,
        inType: 'js',
        outType: 'js',
        parent: null
    });

    build(mainFile, options2);

    return {
        dependencies: dependencies,
        resList: resList
    };
};


