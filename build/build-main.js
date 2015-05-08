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
var encryption = require('ydr-utils').encryption;
var Increase = require('../libs/Increase.js');
var buildModule = require('./build-module.js');

module.exports = function (mainFile, callback) {
    var bufferList = [];
    // 入口模块名称
    var mainName = path.basename(mainFile);
    // 自增对象
    var increase = new Increase();
    // 模块绝对路径 <=> ID 对应表
    var depIdsMap = {};
    // 记录已经构建的列表
    var depsCache = {};
    var depsLength = 1;
    var depsRelationship = {};
    var md5List = '';
    var deepDeps = [];

    var _deepBuld = function (name, type, file) {
        buildModule(name, type, file, increase, depIdsMap, function (err, meta) {
            if (err) {
                log("build", dato.fixPath(file), "error");
                log('build', err.message, 'error');
                process.exit();
            }

            console.log(meta);
            process.exit();

            var code = meta.code;
            var depIdList = meta.depIdList;
            var depNameList = meta.depNameList;
            var output;

            // 采用内容 MD5
            md5List += encryption.etag(code);
            depsCache[mainFile] = true;
            bufferList.push(new Buffer("\n" + code, "utf8"));
            depsRelationship[file] = {};

            if (depIdList.length) {
                depIdList.forEach(function (depId, index) {
                    depsRelationship[file][depId] = true;

                    if (deepDeps.indexOf(depId) === -1) {
                        deepDeps.push(depId);
                    }

                    if (depsRelationship[depId] && depsRelationship[depId][file]) {
                        log('depend cycle', dato.fixPath(file) + '\n' + dato.fixPath(depId), 'error');
                        process.exit();
                    }

                    if (!depsCache[depId]) {
                        depsCache[depId] = true;
                        //log("require", dato.fixPath(depId));
                        _deepBuld(depNameList[index], depId);
                        depsLength++;
                    }
                });
            }

            if (depsLength === bufferList.length) {
                output = sign('js');
                output += Buffer.concat(bufferList).toString();
                callback(null, output, md5List, deepDeps);
            }
        });
    };

    // 第一个 define 模块为入口模块，不必指定其 name
    depIdsMap[mainFile] = '0';
    log("√", dato.fixPath(mainFile), "success");
    _deepBuld(mainName, 'js', mainFile);
};
