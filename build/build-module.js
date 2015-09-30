/*!
 * build-module.js
 * @author ydr.me
 * @create 2014-10-23 21:06
 */


"use strict";

var howdo = require('howdo');
var path = require('ydr-utils').path;
var fs = require('fs-extra');
var log = require('../libs/log.js');
var base64 = require('../libs/base64.js');
var dato = require('ydr-utils').dato;
var pathURI = require("../libs/path-uri.js");
var parseDeps = require('../libs/parse-deps.js');
var jsminify = require('../libs/jsminify.js');
var replaceRequire = require('../libs/replace-require.js');
var parseAsync = require('../libs/parse-async.js');
var replaceDefine = require('../libs/replace-define.js');
var wrapDefine = require('../libs/wrap-define.js');
var globalId = require('../libs/global-id.js');
var copy = require('../libs/copy.js');


/**
 * 构建一个模块
 * @param mainFile {String} 入口模块
 * @param meta {Object} 文件名称
 * @param file {String} 文件路径
 * @param depIdsMap {Object} 模块绝对路径 <=> ID 对应表
 * @param buildAsync {Function} 构建异步入口
 * @param callback {Function} 回调，返回包括
 * @arguments[0].code 压缩替换后的代码
 * @arguments[1].deps 文件依赖的文件列表
 * @arguments[2].depIdsMap 文件依赖的文件列表
 */
module.exports = function (mainFile, meta, file, depIdsMap, buildAsync, callback) {
    var type = meta.type;
    // 依赖 ID 列表
    var depList = [];
    // 依赖绝对路径与 ID 对应关系
    var depIdMap = {};
    // 依赖名称列表
    var depNameList = [];
    // 依赖名称与 ID 对应关系
    var depName2IdMap = {};
    // 单独的文件，没有依赖
    var isSingle = type !== 'js';
    // 相对目录
    var relativeDir = path.dirname(file);
    var configs = global.configs;

    howdo
        // 1. 读取文件内容
        .task(function (next) {
            if (isSingle) {
                wrapDefine(file, depIdsMap, meta, next);
            } else {
                try {
                    next(null, fs.readFileSync(file, 'utf8'));
                } catch (err) {
                    log('build module', pathURI.toSystemPath(file), 'error');
                    log('read file', pathURI.toSystemPath(file), 'error');
                    log('read file', err.message, 'error');
                    process.exit(1);
                }
            }
        })


        // 2. 读取依赖
        .task(function (next, code) {
            if (!isSingle) {
                var deps = parseDeps(file, code);

                deps.forEach(function (dep) {
                    var depName = dep.name;
                    var depId = path.join(relativeDir, depName);

                    depId = pathURI.toSystemPath(depId);

                    var chunkId = configs._chunkFileMap[depId];

                    // 当前依赖模块属于独立块状模块 && 同步模块
                    if (chunkId && !meta.async) {
                        depNameList.push(dep.raw);
                        configs._chunkModuleMap[depId] = configs._chunkModuleMap[depId] || {};
                        configs._chunkModuleMap[depId].type = 'chunk';
                        configs._chunkModuleMap[depId].gid = configs._chunkModuleMap[depId].gid || globalId.get();
                        configs._chunkModuleMap[depId].depending = configs._chunkModuleMap[depId].depending || [];
                        depName2IdMap[dep.raw] = depIdsMap[depId] = configs._chunkModuleMap[depId].gid;

                        if (configs._chunkModuleMap[depId].depending.indexOf(mainFile) === -1) {
                            configs._chunkModuleMap[depId].depending.push(mainFile);
                        }

                        depList.push({
                            name: dep.name,
                            id: depId,
                            type: dep.type,
                            chunk: true,
                            gid: configs._chunkModuleMap[depId].gid
                        });

                        return;
                    }


                    configs._privateModuleMap[file] = configs._privateModuleMap[file] || {};
                    configs._privateModuleMap[file].id = file;
                    configs._privateModuleMap[file].type = 'private';
                    configs._privateModuleMap[file].dependencies = configs._privateModuleMap[file].dependencies || [];

                    if (configs._privateModuleMap[file].dependencies.indexOf(depId) === -1) {
                        configs._privateModuleMap[file].dependencies.push(depId);
                    }

                    configs._privateModuleMap[depId] = configs._privateModuleMap[depId] || {};
                    configs._privateModuleMap[depId].id = depId;
                    configs._privateModuleMap[depId].type = 'private';
                    configs._privateModuleMap[depId].gid = configs._privateModuleMap[depId].gid || globalId.get();
                    configs._privateModuleMap[depId].depending = configs._privateModuleMap[depId].depending || [];
                    configs._privateModuleMap[depId].parents = configs._privateModuleMap[depId].parents || [];

                    if (configs._privateModuleMap[depId].parents.indexOf(file) === -1) {
                        configs._privateModuleMap[depId].parents.push(file);
                    }

                    if (configs._privateModuleMap[depId].depending.indexOf(mainFile) === -1) {
                        configs._privateModuleMap[depId].depending.push(mainFile);
                    }

                    depNameList.push(dep.raw);
                    depIdsMap[depId] = configs._privateModuleMap[depId].gid;

                    if (!depIdMap[depId]) {
                        depIdMap[depId] = true;
                        depList.push({
                            name: dep.name,
                            id: depId,
                            type: dep.type,
                            outType: dep.outType,
                            pipeline: dep.pipeline,
                            chunk: false,
                            gid: depIdsMap[depId]
                        });
                    }

                    depName2IdMap[dep.raw] = depIdsMap[depId];
                });
            }

            next(null, code);
        })


        // 3. 替换 require
        .task(function (next, code) {
            if (!isSingle) {
                code = replaceRequire(file, code, depNameList, depName2IdMap);
            }

            next(null, code);
        })


        // 4. 解析 require.async
        .task(function (next, code) {
            if (!isSingle) {
                var asyncList = parseAsync(file, code);

                if(!asyncList.length){
                    return next(null, code);
                }

                // 进行异步模块构建
                return buildAsync(asyncList, code, next);
            }

            next(null, code);
        })


        // 5. 压缩
        .task(function (next, code) {
            if (isSingle) {
                next(null, code);
            } else {
                jsminify(file, code, next);
            }
        })


        // 6. 替换 define
        .task(function (next, code) {
            if (isSingle) {
                next(null, code);
            } else {
                code = replaceDefine(file, code, depList, depIdsMap);
                next(null, code);
            }
        })


        // 异步串行
        .follow(function (err, code) {
            callback(err, {
                isSingle: isSingle,
                code: code,
                depList: depList
            });
        });
};
