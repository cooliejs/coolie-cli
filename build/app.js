/**
 * 遍历构建入口
 * @author ydr.me
 * @create 2015-10-27 11:25
 */


'use strict';

var debug = require('ydr-utils').debug;
var path = require('ydr-utils').path;
var dato = require('ydr-utils').dato;
var fse = require('fs-extra');

var parseMain = require('../parse/main.js');
var parseChunk = require('../parse/chunk.js');
var buildMain = require('./main.js');
var pathURI = require('../utils/path-uri.js');
var globalId = require('../utils/global-id.js');
var writer = require('../utils/writer.js');
var arrayString = require('../utils/array-string.js');

var defaults = {
    glob: [],
    chunk: [],
    // >= 2 的模块才会被 chunk 化
    minDependingCount2Chunk: 2,
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
    destCoolieConfigBaseDirname: null,
    destCoolieConfigChunkDirname: null,
    destCoolieConfigAsyncDirname: null,
    removeHTMLYUIComments: true,
    removeHTMLLineComments: true,
    joinHTMLSpaces: true,
    removeHTMLBreakLines: true
};

/**
 * 遍历构建入口
 * @param options {Object} 配置
 * @param options.glob {String|Array} main 配置
 * @param options.chunk {String|Array} chunk 配置
 * @param options.minDependingCount2Chunk {Number} 最小引用次数分离 chunk
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
 * @param options.destCoolieConfigChunkDirname {String} coolie-config:chunk 目录
 * @param options.destCoolieConfigAsyncDirname {String} coolie-config:async 目录
 * @param [options.removeHTMLYUIComments=true] {Boolean} 是否去除 YUI 注释
 * @param [options.removeHTMLLineComments=true] {Boolean} 是否去除行注释
 * @param [options.joinHTMLSpaces=true] {Boolean} 是否合并空白
 * @param [options.removeHTMLBreakLines=true] {Boolean} 是否删除断行
 */
module.exports = function (options) {
    options = dato.extend(true, {}, defaults, options);

    // 1、分析 main
    var mainMap = parseMain({
        glob: options.glob,
        srcDirname: options.srcDirname,
        globOptions: options.globOptions
    });

    // 2、分析 chunk
    // chunk => index
    var chunkFileMap = parseChunk({
        chunk: options.chunk,
        srcDirname: options.srcDirname,
        globOptions: options.globOptions
    });
    // 独立模块
    var singleModuleMap = {};
    // chunk 模块引用计数
    var chunkDependingCountMap = {};
    // 入口文件计数
    var mainIndex = 0;
    // 模块依赖 map
    var appMap = {};

    // 3、chunk 计数统计
    dato.each(mainMap, function (mainFile, mainMeta) {
        var dependencies = buildMain(mainFile, {
            uglifyJSOptions: options.uglifyJSOptions,
            srcDirname: options.srcDirname,
            destDirname: options.destDirname,
            destResourceDirname: options.destResourceDirname,
            destHost: options.destHost,
            versionLength: options.versionLength,
            minifyResource: options.minifyResource,
            cleanCSSOptions: options.cleanCSSOptions,
            removeHTMLYUIComments: options.removeHTMLYUIComments,
            removeHTMLLineComments: options.removeHTMLLineComments,
            joinHTMLSpaces: options.joinHTMLSpaces,
            removeHTMLBreakLines: options.removeHTMLBreakLines
        });

        appMap[mainFile] = dependencies.map(function (dependency) {
            return dependency.file;
        });

        // [{id: String, file: String, buffer: Buffer, md5: String}]
        dato.each(dependencies, function (index, dependency) {
            var chunkIndex = chunkFileMap[dependency.file];

            if (chunkIndex) {
                chunkDependingCountMap[dependency.id] = chunkDependingCountMap[dependency.id] || {
                        chunkIndex: chunkIndex,
                        id: dependency.id,
                        file: dependency.file,
                        buffer: dependency.buffer,
                        md5: dependency.md5,
                        count: 0,
                        mainIndexList: []
                    };
                chunkDependingCountMap[dependency.id].count++;
                chunkDependingCountMap[dependency.id].mainIndexList.push(mainIndex);
            } else {
                singleModuleMap[mainIndex] = singleModuleMap[mainIndex] || {
                        srcFile: mainFile,
                        bufferList: [],
                        md5List: [],
                        mainIndex: mainIndex,
                        chunkMap: {},
                        chunkList: [],
                        async: mainMeta.async,
                        file: dependency.file
                    };
                singleModuleMap[mainIndex].bufferList.push(dependency.buffer);
                singleModuleMap[mainIndex].md5List.push(dependency.md5);
            }
        });
        mainIndex++;
    });

    // 4、chunk 分组
    var chunkGroupMap = {};
    // [{chunkIndex, Number, id: String, file: String, buffer: Buffer, md5: String, count: Number, mainIndex: Number}]
    dato.each(chunkDependingCountMap, function (chunkId, chunkMeta) {
        var chunkIndex = chunkMeta.chunkIndex;
        var mainIndexList = chunkMeta.mainIndexList;
        var mainIndex0 = mainIndexList[0];

        // 被多次引用
        if (chunkMeta.count >= options.minDependingCount2Chunk) {
            chunkGroupMap[chunkIndex] = chunkGroupMap[chunkIndex] || {
                    bufferList: [],
                    md5List: []
                };
            chunkGroupMap[chunkIndex].bufferList.push(chunkMeta.buffer);
            chunkGroupMap[chunkIndex].md5List.push(chunkMeta.md5);

            dato.each(mainIndexList, function (index, _mainIndex) {
                if (!singleModuleMap[_mainIndex].chunkMap[chunkIndex]) {
                    singleModuleMap[_mainIndex].chunkMap[chunkIndex] = true;
                    singleModuleMap[_mainIndex].chunkList.push(chunkIndex);
                }
            });
        }
        // 只被一次引用
        else {
            singleModuleMap[mainIndex0].bufferList.push(chunkMeta.buffer);
            singleModuleMap[mainIndex0].md5List.push(chunkMeta.md5);
        }
    });

    // 5、chunk 新建
    var chunkVersionMap = {};
    // [{bufferList: Array, md5List: Array}]
    dato.each(chunkGroupMap, function (groupIndex, groupMeta) {
        var ret = writer({
            srcDirname: options.srcDirname,
            destDirname: options.destCoolieConfigChunkDirname,
            fileNameTemplate: groupIndex + '.${version}.js',
            signType: 'js',
            bufferList: groupMeta.bufferList,
            versionList: groupMeta.md5List,
            versionLength: options.versionLength
        });

        chunkVersionMap[pathURI.removeVersion(ret.path)] = ret.version;
    });

    // 6、single 重建
    var mainVersionMap = {};
    var asyncVersionMap = {};
    // [{srcFile: String, bufferList: Array, md5List: Array, chunkList: Array, chunkMap: Object, async: Boolean, mainIndex: Number, file: String}]
    dato.each(singleModuleMap, function (singleIndex, singleMeta) {
        if (singleMeta.chunkList.length) {
            singleMeta.bufferList.push(new Buffer('\ncoolie.chunk(' + arrayString.stringify(singleMeta.chunkList) + ');'));
        }

        var asyncId = '';

        if (singleMeta.async) {
            asyncId = globalId.get(singleMeta.file, 'js');
        }

        var ret = writer({
            srcDirname: options.srcDirname,
            destDirname: singleMeta.async ? options.destCoolieConfigAsyncDirname : options.destCoolieConfigBaseDirname,
            fileNameTemplate: (singleMeta.async ? asyncId + '.' : '') + '${version}.js',
            signType: 'js',
            bufferList: singleMeta.bufferList,
            versionList: singleMeta.md5List,
            versionLength: options.versionLength
        });

        if (asyncId) {
            asyncVersionMap[pathURI.removeVersion(ret.path)] = ret.version;
        } else {
            mainVersionMap[singleMeta.srcFile] = ret.version;
        }
    });

    return {
        mainVersionMap: mainVersionMap,
        chunkVersionMap: chunkVersionMap,
        asyncVersionMap: asyncVersionMap,
        appMap: appMap
    };
};


