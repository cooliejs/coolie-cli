/*!
 * 构建入口模块
 * @author ydr.me
 * @create 2014-10-23 19:44
 */


"use strict";

var path = require('ydr-utils').path;
var fs = require('fs-extra');
var howdo = require('howdo');
var log = require('../libs/log.js');
var dato = require('ydr-utils').dato;
var pathURI = require("../libs/path-uri.js");
var encryption = require('ydr-utils').encryption;
var buildModule = require('./build-module.js');


/**
 * 构建入口模块
 * @param mainFile
 * @param mainInfo
 * @param mainInfo.async {Boolean} 是否为异步模块
 * @param mainInfo.gid {String} 全局 ID
 * @param mainInfo.asyncList {Array} 依赖的异步模块
 * @param callback
 */
module.exports = function (mainFile, mainInfo, callback) {
    var bufferList = [];
    // 入口模块名称
    var mainName = path.basename(mainFile);
    // 记录已经构建的列表
    var depsCache = {};
    var depsLength = 1;
    var depsRelationship = {};
    var md5List = '';
    var deepDeps = [];
    var chunkList = [];
    var configs = global.configs;

    var _deepBuld = function (meta, moduleFile) {
        buildModule(mainFile, meta, moduleFile, function (err, meta) {
            if (err) {
                log('build', pathURI.toSystemPath(moduleFile), 'error');
                log('build', err.message, 'error');
                process.exit(1);
            }

            var depList = meta.depList;
            var isChunk = configs._chunkModuleMap[moduleFile];
            var md5 = encryption.md5(meta.code);

            if (isChunk) {
                configs._chunkBufferMap[moduleFile] = new Buffer('\n' + meta.code, 'utf8');
                configs._chunkMD5Map[moduleFile] = md5;
                bufferList.push(new Buffer('', 'utf8'));
            } else {
                md5List += md5;
                bufferList.push(new Buffer('\n' + meta.code, 'utf8'));
            }

            depsCache[mainFile] = true;
            depsRelationship[moduleFile] = {};

            if (depList.length) {
                depList.forEach(function (dep) {
                    var depId = dep.id;

                    depsRelationship[moduleFile][depId] = true;

                    if (deepDeps.indexOf(depId) === -1) {
                        deepDeps.push(depId);
                    }

                    if (dep.chunk) {
                        var chunkId = configs._chunkFileMap[dep.id];

                        if (chunkList.indexOf(chunkId) === -1) {
                            chunkList.push(chunkId);
                        }
                    }

                    if (depsRelationship[depId] && depsRelationship[depId][moduleFile]) {
                        log('make depended cycle', pathURI.toSystemPath(moduleFile) + '\n' +
                            pathURI.toSystemPath(depId), 'error');
                        process.exit(1);
                    }

                    if (!depsCache[depId]) {
                        depsCache[depId] = true;
                        //log("require", pathURI.toSystemPath(depId));
                        _deepBuld(dep, depId);
                        depsLength++;
                    }
                });
            }

            if (depsLength === bufferList.length) {
                log("√", pathURI.toRootURL(mainFile), "success");
                delete(depsCache[mainFile]);
                callback(null, {
                    bufferList: bufferList,
                    md5List: md5List,
                    deepDeps: deepDeps,
                    chunkList: chunkList,
                    depFiles: Object.keys(depsCache)
                });
            }
        });
    };

    _deepBuld({
        name: mainName,
        type: 'js',
        pipeline: 'js'
    }, mainFile);
};

