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
    var _deepBuld = function (file) {
        buildModule(file, increase, depIdsMap, function (err, meta) {
            if (err) {
                log("build", file, "error");
                process.exit();
            }

            var code = meta.code;
            var deps = meta.deps;
            var output;

            depsCache[mainFile] = true;
            bufferList.push(new Buffer("\n" + code, "utf8"));

            if (deps.length) {
                deps.forEach(function (dep) {
                    if (!depsCache[dep]) {
                        depsCache[dep] = true;
                        log("require", dep);
                        _deepBuld(dep);
                        depsLength++;
                    }
                });
            }

            if (depsLength === bufferList.length) {
                output = "/*coolie " + Date.now() + "*/" +
                Buffer.concat(bufferList).toString();
                callback(null, output);
            }
        });
    };

    depIdsMap[mainFile] = mainName;
    log("build main", mainFile, "warning");
    _deepBuld(mainFile);
};
