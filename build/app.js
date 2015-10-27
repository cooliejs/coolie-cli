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
    destCoolieConfigBaseDirname: null
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
    // chunk 模块引用计数
    var chunkDependingCountMap = {};

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
            destCoolieConfigBaseDirname: options.destCoolieConfigBaseDirname
        });

        // [{id: String, file: String, buffer: Buffer, md5: String}]
        dato.each(dependencies, function (index, dependency) {
            var isChunk = chunkFileMap[dependency.file];

            if (isChunk) {
                chunkDependingCountMap[dependency.id] = chunkDependingCountMap[dependency.id] || {
                        index: index,
                        id: dependency.id,
                        file: dependency.file,
                        buffer: dependency.buffer,
                        md5: dependency.md5,
                        count: 0
                    };
                chunkDependingCountMap[dependency.id].count++;
            }
        });
    });

    // 4、chunk 分组
    var chunkGroupMap = {};
    // [{index, Number, id: String, file: String, buffer: Buffer, md5: String, count: Number}]
    dato.each(chunkDependingCountMap, function (chunkId, chunkMeta) {
        if (chunkMeta.count >= options.minDependingCount2Chunk) {
            chunkGroupMap[chunkMeta.index] = chunkGroupMap[chunkMeta.index] || {
                    bufferList: [],
                    versionList: []
                };
            chunkGroupMap[chunkMeta.index].bufferList.push(chunkMeta.buffer);
            chunkGroupMap[chunkMeta.index].versionList.push(chunkMeta.md5);
        }
    });

    // 5、chunk 新建
    // [{bufferList: Array, versionList: Array}]
    dato.each(chunkGroupMap, function (groupIndex, groupMeta) {
        var chunkVersion = groupMeta.versionList.join('').slice(0, options.versionLength);
        var chunkPath = path.join(options.destCoolieConfigChunkDirname, groupIndex + '.' + chunkVersion + '.js')
        groupMeta.bufferList.unshift(new Buffer(sign('js'), 'utf8'));
        var buffer = Buffer.concat(groupMeta.bufferList);

        try {
            fse.outputFileSync(chunkPath, buffer);
        } catch (err) {
            debug.error('write chunk', path.toSystem(chunkPath));
            debug.error('write file', err.message);
            return process.exit(1);
        }
    });

    //// 6、模块重建
};


