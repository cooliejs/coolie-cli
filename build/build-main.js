/*!
 * 构建入口模块
 * @author ydr.me
 * @create 2014-10-23 19:44
 */


"use strict";

var path = require('path');
var fs = require('fs-extra');
var log = require('../libs/log.js');
var sign = require('../libs/sign.js');
var dato = require('ydr-utils').dato;
var pathURI = require("../libs/path-uri.js");
var encryption = require('ydr-utils').encryption;
var buildModule = require('./build-module.js');


module.exports = function (mainFile, callback) {
    var bufferList = [];
    // 入口模块名称
    var mainName = path.basename(mainFile);
    // 模块绝对路径 <=> ID 对应表
    var depIdsMap = {};
    // 记录已经构建的列表
    var depsCache = {};
    var depsLength = 1;
    var depsRelationship = {};
    var md5List = '';
    var deepDeps = [];
    var chunkList = [];
    var configs = global.configs;

    var _deepBuld = function (name, type, file) {
        buildModule(mainFile, name, type, file, depIdsMap, function (err, meta) {
            if (err) {
                log('build', pathURI.toSystemPath(file), 'error');
                log('build', err.message, 'error');
                process.exit(1);
            }

            var depList = meta.depList;
            var isChunk = configs._chunkModuleMap[file];
            var md5 = encryption.md5(meta.code).slice(0, configs.dest.md5Length);

            if (isChunk) {
                configs._chunkBufferMap[file] = new Buffer('\n' + meta.code, 'utf8');
                configs._chunkMD5Map[file] = md5;
                bufferList.push(new Buffer('', 'utf8'));
            } else {
                md5List += md5;
                bufferList.push(new Buffer('\n' + meta.code, 'utf8'));
            }

            depsCache[mainFile] = true;
            depsRelationship[file] = {};

            if (depList.length) {
                depList.forEach(function (dep) {
                    var depId = dep.id;

                    depsRelationship[file][depId] = true;

                    if (deepDeps.indexOf(depId) === -1) {
                        deepDeps.push(depId);
                    }

                    if (dep.chunk) {
                        var chunkId = configs._chunkFileMap[dep.id];

                        if (chunkList.indexOf(chunkId) === -1) {
                            chunkList.push(chunkId);
                        }
                    }

                    if (depsRelationship[depId] && depsRelationship[depId][file]) {
                        log('depend cycle', pathURI.toSystemPath(file) + '\n' +
                            pathURI.toSystemPath(depId), 'error');
                        process.exit(1);
                    }

                    if (!depsCache[depId]) {
                        depsCache[depId] = true;
                        //log("require", pathURI.toSystemPath(depId));
                        _deepBuld(dep.name, dep.type, depId);
                        depsLength++;
                    }
                });
            }

            if (depsLength === bufferList.length) {
                log("√", pathURI.toSystemPath(mainFile), "success");
                callback(null, bufferList, md5List, deepDeps, chunkList);
            }
        });
    };

    // 第一个 define 模块为入口模块，不必指定其 name
    depIdsMap[mainFile] = '0';
    _deepBuld(mainName, 'js', mainFile);
};
