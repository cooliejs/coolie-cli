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
var replaceDefine = require('../libs/replace-define.js');
var wrapDefine = require('../libs/wrap-define.js');
var globalId = require('../libs/global-id.js');
var copy = require('../libs/copy.js');


/**
 * 构建一个模块
 * @param mainFile {String} 入口模块
 * @param meta {Object} 模块属性
 * @param meta.name {String} 名称
 * @param meta.type {String} 类型
 * @param meta.pipeline {String} 管道
 * @param moduleFile {String} 文件路径
 * @param callback {Function} 回调，返回包括
 * @arguments[0].code 压缩替换后的代码
 * @arguments[1].deps 文件依赖的文件列表
 */
module.exports = function (mainFile, meta, moduleFile, callback) {
    var type = meta.type;
    // 依赖 ID 列表
    var depList = [];
    var asyncList = [];
    // 依赖绝对路径与 ID 对应关系
    var depIdMap = {};
    // 依赖名称列表
    var depNameList = [];
    // 依赖名称与 ID 对应关系
    var depName2IdMap = {};
    // 单独的文件，没有依赖
    var isSingle = type !== 'js';
    // 相对目录
    var configs = global.configs;
    // 是否为入口模块
    var isMain = mainFile === moduleFile;

    howdo
        // 1. 读取文件内容
        .task(function (next) {
            if (isSingle) {
                wrapDefine(moduleFile, meta, next);
            } else {
                if (configs._bufferMap[moduleFile]) {
                    return next(null, configs._bufferMap[moduleFile].toString());
                }

                try {
                    next(null, fs.readFileSync(moduleFile, 'utf8'));
                } catch (err) {
                    log('build module', pathURI.toSystemPath(moduleFile), 'error');
                    log('read file', pathURI.toSystemPath(moduleFile), 'error');
                    log('read file', err.message, 'error');
                    process.exit(1);
                }
            }
        })


        // 2. 读取依赖
        .task(function (next, code) {
            if (!isSingle) {
                var deps = parseDeps(moduleFile, code);

                deps.forEach(function (dep) {
                    // 模块的唯一物理路径
                    var depId = dep.id;
                    // 全局的模块 ID
                    configs._moduleIdMap[depId] = configs._moduleIdMap[depId] || globalId.get();

                    var chunkId = configs._chunkFileMap[depId];

                    // 当前依赖模块属于独立块状模块
                    if (chunkId) {
                        depNameList.push(dep.raw);
                        configs._chunkModuleMap[depId] = configs._chunkModuleMap[depId] || {};
                        configs._chunkModuleMap[depId].type = 'chunk';
                        configs._chunkModuleMap[depId].gid = configs._moduleIdMap[depId];
                        configs._chunkModuleMap[depId].depending = configs._chunkModuleMap[depId].depending || [];
                        depName2IdMap[dep.raw] = configs._chunkModuleMap[depId].gid;

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


                    configs._privateModuleMap[moduleFile] = configs._privateModuleMap[moduleFile] || {};
                    configs._privateModuleMap[moduleFile].id = moduleFile;
                    configs._privateModuleMap[moduleFile].type = 'private';
                    configs._privateModuleMap[moduleFile].dependencies = configs._privateModuleMap[moduleFile].dependencies || [];

                    if (configs._privateModuleMap[moduleFile].dependencies.indexOf(depId) === -1) {
                        configs._privateModuleMap[moduleFile].dependencies.push(depId);
                    }

                    configs._privateModuleMap[depId] = configs._privateModuleMap[depId] || {};
                    configs._privateModuleMap[depId].id = depId;
                    configs._privateModuleMap[depId].type = 'private';
                    configs._privateModuleMap[depId].gid = configs._moduleIdMap[depId];
                    configs._privateModuleMap[depId].depending = configs._privateModuleMap[depId].depending || [];
                    configs._privateModuleMap[depId].parents = configs._privateModuleMap[depId].parents || [];

                    if (configs._privateModuleMap[depId].parents.indexOf(moduleFile) === -1) {
                        configs._privateModuleMap[depId].parents.push(moduleFile);
                    }

                    if (configs._privateModuleMap[depId].depending.indexOf(mainFile) === -1) {
                        configs._privateModuleMap[depId].depending.push(mainFile);
                    }

                    depNameList.push(dep.raw);

                    if (!depIdMap[depId]) {
                        depIdMap[depId] = true;
                        depList.push({
                            name: dep.name,
                            id: depId,
                            type: dep.type,
                            outType: dep.outType,
                            pipeline: dep.pipeline,
                            chunk: false,
                            gid: configs._moduleIdMap[depId]
                        });
                    }

                    depName2IdMap[dep.raw] = configs._moduleIdMap[depId];
                });
            }

            next(null, code);
        })

        // 3. 替换 require
        .task(function (next, code) {
            if (!isSingle) {
                code = replaceRequire(moduleFile, code, depNameList, depName2IdMap);
            }

            next(null, code);
        })

        // 4. 压缩
        .task(function (next, code) {
            if (isSingle) {
                next(null, code);
            } else {
                jsminify(moduleFile, code, next);
            }
        })


        // 5. 替换 define
        .task(function (next, code) {
            if (isSingle) {
                next(null, code);
            } else {
                code = replaceDefine(moduleFile, code, depList);
                next(null, code);
            }
        })


        // 异步串行
        .follow(function (err, code) {
            callback(err, {
                isSingle: isSingle,
                code: code,
                depList: depList,
                asyncList: asyncList
            });
        });
};
