/**
 * 遍历构建入口
 * @author ydr.me
 * @create 2015-10-27 11:25
 */


'use strict';

var debug = require('ydr-utils').debug;
var path = require('ydr-utils').path;
var dato = require('ydr-utils').dato;
var encryption = require('ydr-utils').encryption;
var fse = require('fs-extra');

var parseMain = require('../parse/main.js');
var parseChunk = require('../parse/chunk.js');
var buildMain = require('./main.js');
var sign = require('../utils/sign.js');
var pathURI = require('../utils/path-uri.js');
var writer = require('../utils/writer.js');

var defaults = {
    main: [],
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
 * @param options.main {String|Array} main 配置
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
        main: options.main,
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

    // 3、chunk 计数统计
    dato.each(mainMap, function (mainFile, mainMeta) {
        var dependencies = buildMain(mainFile, {
            async: mainMeta.async,
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
                        mainIndex: mainIndex
                    };
                chunkDependingCountMap[dependency.id].count++;
            }else{
                singleModuleMap[mainIndex] = singleModuleMap[mainIndex] || {
                        bufferList: [],
                        md5List: [],
                        mainIndex: mainIndex
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
        // 被多次引用
        if (chunkMeta.count >= options.minDependingCount2Chunk) {
            chunkGroupMap[chunkMeta.chunkIndex] = chunkGroupMap[chunkMeta.chunkIndex] || {
                    bufferList: [],
                    md5List: []
                };
            chunkGroupMap[chunkMeta.chunkIndex].bufferList.push(chunkMeta.buffer);
            chunkGroupMap[chunkMeta.chunkIndex].md5List.push(chunkMeta.md5);
        }
        // 只被一次引用
        else{
            singleModuleMap[chunkMeta.mainIndex].bufferList.push(chunkMeta.buffer);
            singleModuleMap[chunkMeta.mainIndex].md5List.push(chunkMeta.md5);
        }
    });

    // 5、chunk 新建
    // [{bufferList: Array, md5List: Array}]
    dato.each(chunkGroupMap, function (groupIndex, groupMeta) {
        writer({
            srcDirname: options.srcDirname,
            destDirname: options.destCoolieConfigChunkDirname,
            fileNameTemplate: groupIndex + '.${version}.js',
            signType: 'js',
            bufferList: groupMeta.bufferList,
            versionList: groupMeta.md5List,
            versionLength: options.versionLength
        });
    });

    // 6、模块重建
    // [{bufferList: Array, md5List: Array}]
    dato.each(singleModuleMap, function (singleIndex, singleMeta) {
        writer({
            srcDirname: options.srcDirname,
            destDirname: options.destCoolieConfigBaseDirname,
            fileNameTemplate: '${version}.js',
            signType: 'js',
            bufferList: singleMeta.bufferList,
            versionList: singleMeta.md5List,
            versionLength: options.versionLength
        });
    });
};


