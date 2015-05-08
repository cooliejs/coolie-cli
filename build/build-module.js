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
var dato = require('ydr-utils').dato;
var parseDeps = require('../libs/parse-deps.js');
var jsminify = require('../libs/jsminify.js');
var replaceRequire = require('../libs/replace-require.js');
var replaceDefine = require('../libs/replace-define.js');
var wrapDefine = require('../libs/wrap-define.js');
var REG_SINGLE = /^(css|html|text|image)!/i;


/**
 * 构建一个模块
 * @param name 文件名称
 * @param type 依赖类型
 * @param file 文件路径
 * @param increase 自增对象
 * @param depIdsMap 依赖ID对应表
 * @param callback 回调，返回包括
 * @arguments[1].code 压缩替换后的代码
 * @arguments[1].deps 文件依赖的文件列表
 * @arguments[1].depIdsMap 文件依赖的文件列表
 */
module.exports = function (name, type, file, increase, depIdsMap, callback) {
    // 依赖 ID 列表
    var depIdList = [];
    // 依赖名称列表
    var depNameList = [];
    // 依赖名称与 ID 对应关系
    var depName2IdMap = {};
    // 当前文件的目录
    var singleMatched = name.match(REG_SINGLE);
    var isSingle = !!singleMatched;
    var singleType = (singleMatched || ['', ''])[1];
    // 相对目录
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
                log('read', dato.fixPath(file), 'error');
                log('read', err.message, 'error');
                process.exit();
            }
        })


        // 2. 读取依赖
        .task(function (next, code) {
            if (!isSingle) {
                parseDeps(file, code).forEach(function (dep) {
                    var depName = dep.name;
                    var depId = path.join(relativeDir, depName);

                    if (depIdList.indexOf(depId) === -1) {
                        depIdList.push(depId);
                        depNameList.push(depName);

                        if (!depIdsMap[depId]) {
                            depIdsMap[depId] = increase.add();
                        }

                        depName2IdMap[depName] = depIdsMap[depId];
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
                wrapDefine(file, code, depIdsMap, singleType, next);
            } else {
                code = replaceDefine(file, code, depIdList, depIdsMap);
                next(null, code);
            }
        })


        .follow(function (err, code) {
            callback(err, {
                isSingle: isSingle,
                code: code,
                depNameList: depNameList,
                depIdList: depIdList
            });
        });
};
