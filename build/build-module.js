/*!
 * build-module.js
 * @author ydr.me
 * @create 2014-10-23 21:06
 */


"use strict";

var howdo = require('howdo');
var path = require('path');
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
// 块状模块与 ID 对应表
var chunkModuleIdMap = {};


/**
 * 构建一个模块
 * @param name 文件名称
 * @param type 依赖类型
 * @param file 文件路径
 * @param depIdsMap 模块绝对路径 <=> ID 对应表
 * @param callback 回调，返回包括
 * @arguments[1].code 压缩替换后的代码
 * @arguments[1].deps 文件依赖的文件列表
 * @arguments[1].depIdsMap 文件依赖的文件列表
 */
module.exports = function (name, type, file, depIdsMap, callback) {
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
            // 文件内容
            var code = '';

            try {
                code = type === 'image' ? base64(file) : fs.readFileSync(file, 'utf8');
                next(null, code);
            } catch (err) {
                log('read file', pathURI.toSystemPath(file), 'error');
                log('read file', err.message, 'error');
                process.exit(1);
            }
        })


        // 2. 读取依赖
        .task(function (next, code) {
            if (!isSingle) {
                parseDeps(file, code).forEach(function (dep) {
                    var depName = dep.name;
                    var depId = path.join(relativeDir, depName);

                    // 当前依赖模块属于独立块状模块
                    if (configs._chunkMap[depId]) {
                        depList.push({
                            name: dep.name,
                            id: depId,
                            type: dep.type
                        });
                        depNameList.push(dep.raw);
                        depName2IdMap[dep.raw] = depIdMap[depId] = chunkModuleIdMap[depId] = globalId.get();
                        return;
                    }

                    if (!depIdMap[depId]) {
                        depList.push({
                            name: dep.name,
                            id: depId,
                            type: dep.type
                        });
                        depIdMap[depId] = true;
                        depNameList.push(dep.raw);

                        if (!depIdsMap[depId]) {
                            depIdsMap[depId] = globalId.get();
                        }

                        depName2IdMap[dep.raw] = depIdsMap[depId];
                    }
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


        // 4. 压缩
        .task(function (next, code) {
            if (isSingle) {
                next(null, code);
            } else {
                jsminify(file, code, next);
            }
        })


        // 5. 替换 define
        .task(function (next, code) {
            if (isSingle) {
                wrapDefine(file, code, depIdsMap, type, next);
            } else {
                code = replaceDefine(file, code, depList, depIdsMap);
                next(null, code);
            }
        })


        .follow(function (err, code) {
            console.log(chunkModuleIdMap);
            callback(err, {
                isSingle: isSingle,
                code: code,
                depList: depList
            });
        });
};
