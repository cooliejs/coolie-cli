/*!
 * 构建入口模块
 * @author ydr.me
 * @create 2014-10-23 19:44
 */


"use strict";

var path = require('path');
var fs = require('fs-extra');
var log = require('../libs/log.js');
var Increase = require('../libs/Increase.js');
var buildModule = require('./build-module.js');

module.exports = function (mainFile, dest, callback) {
    var bufferList = [];
    // 入口模块名称
    var mainName = path.basename(mainFile);
    // 自增对象
    var increase = new Increase();
    // 模块绝对路径 <=> ID 对应表
    var depIdsMap = {};
    // 记录已经构建的列表
    var depsCache = {};
    var _deepBuld = function (file) {
        // 构建入口模块
        buildModule(file, increase, depIdsMap, function (err, meta) {
            if (err) {
                log('build', file);
                process.exit();
            }

            var code = meta.code;
            var deps = meta.deps;
            var output;

            depsCache[mainFile] = true;
            bufferList.push(new Buffer(code + "\n", "utf8"));

            if (deps.length) {
                deps.forEach(function (dep) {
                    if (!depsCache[dep]) {
                        _deepBuld(dep);
                    }
                });
            } else {
                output = Buffer.concat(bufferList).toString() +
                "/*coolie " + Date.now() + "*/";
                callback(null);
            }
        });
    };

    depIdsMap[mainFile] = mainName;
    _deepBuld(mainFile);
};
