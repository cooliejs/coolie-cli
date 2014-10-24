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
var util = require('../libs/util.js');
var parseDeps = require('../libs/parse-deps.js');
var jsminify = require('../libs/jsminify.js');
var replaceRequire = require('../libs/replace-require.js');
var replaceDefine = require('../libs/replace-define.js');


/**
 * 构建一个模块
 * @param file 文件路径
 * @param increase 自增对象
 * @param depIdsMap 依赖ID对应表
 * @param callback 回调，返回包括
 * @arguments[1].code 压缩替换后的代码
 * @arguments[1].deps 文件依赖的文件列表
 * @arguments[1].depIdsMap 文件依赖的文件列表
 */
module.exports = function (file, increase, depIdsMap, callback) {
    // 原始依赖
    var absDeps = [];
    var relDeps = [];
    var relIdsMap = {};
    // 当前文件的目录
    var relativeDir = path.dirname(file);


    howdo
        // 1. 读取文件内容
        .task(function (next) {
            // 文件内容
            var code = "";

            try {
                code = fs.readFileSync(file, 'utf8');
                next(null, code);
            } catch (err) {
                log('read', util.fixPath(file), 'error');
                log('read', err.message, 'error');
                process.exit();
            }
        })


        // 2. 读取依赖
        .task(function (next, code) {
            parseDeps(code).forEach(function (dep) {
                var absDep;

                if (absDeps.indexOf(dep) === -1) {
                    absDep = path.join(relativeDir, dep);
                    absDeps.push(absDep);
                    relDeps.push(dep);

                    if (!depIdsMap[absDep]) {
                        depIdsMap[absDep] = increase.add();
                    }

                    relIdsMap[dep] = depIdsMap[absDep];
                }
            });

            next(null, code);
        })


        // 3. 压缩
        .task(function (next, code) {
            jsminify(code, next);
        })


        // 4. 替换 define
        .task(function (next, code) {
            code = replaceDefine(file, code, absDeps, depIdsMap);
            next(null, code);
        })


        // 5. 替换 require
        .task(function (next, code) {
            code = replaceRequire(code, relDeps, relIdsMap);
            next(null, code);
        })


        .follow(function (err, code) {
            callback(err, {
                code: code,
                deps: absDeps
            });
        });
};
