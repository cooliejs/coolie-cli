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
var ydrUtil = require('ydr-util');
var parseDeps = require('../libs/parse-deps.js');
var jsminify = require('../libs/jsminify.js');
var replaceRequire = require('../libs/replace-require.js');
var replaceDefine = require('../libs/replace-define.js');
var wrapDefine = require('../libs/wrap-define.js');
var REG_TEXT = /^(css|html|text)!/i;


/**
 * 构建一个模块
 * @param name 文件名称
 * @param file 文件路径
 * @param increase 自增对象
 * @param depIdsMap 依赖ID对应表
 * @param callback 回调，返回包括
 * @arguments[1].code 压缩替换后的代码
 * @arguments[1].deps 文件依赖的文件列表
 * @arguments[1].depIdsMap 文件依赖的文件列表
 */
module.exports = function (name, file, increase, depIdsMap, callback) {
    // 依赖 ID 列表
    var depIdList = [];
    // 依赖名称列表
    var depNameList = [];
    // 依赖名称与 ID 对应关系
    var depName2IdMap = {};
    // 当前文件的目录
    var textMatched = name.match(REG_TEXT);
    var isText = !!textMatched;
    var textType = (textMatched || ['', ''])[1];
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
                log('read', ydrUtil.dato.fixPath(file), 'error');
                log('read', err.message, 'error');
                process.exit();
            }
        })


        // 2. 读取依赖
        .task(function (next, code) {
            if (!isText) {
                parseDeps(file, code).forEach(function (depName) {
                    var isTextPath = !!depName.match(REG_TEXT);
                    var relDepName = depName.replace(REG_TEXT, '');
                    var depId = path.join(relativeDir, _fixPath(relDepName, isTextPath));

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
            if (!isText) {
                code = replaceRequire(file, code, depNameList, depName2IdMap);
            }

            next(null, code);
        })


        // 4. 压缩
        .task(function (next, code) {
            if (isText) {
                next(null, code);
            } else {
                jsminify(file, code, next);
            }
        })


        // 5. 替换 define
        .task(function (next, code) {
            if (isText) {
                wrapDefine(file, code, depIdsMap, textType, next);
            } else {
                code = replaceDefine(file, code, depIdList, depIdsMap);
                next(null, code);
            }
        })


        .follow(function (err, code) {
            callback(err, {
                code: code,
                depNameList: depNameList,
                depIdList: depIdList
            });
        });
};


/**
 * 修正路径
 * @param path {String}
 * @param isRequireText {Boolean}
 * @private
 *
 * @example
 * "text!path/to/a.css" => "path/to/a.css"
 * "path/to/a.min.js?abc123" => "path/to/a.min.js"
 * "path/to/a" => "path/to/a.js"
 * "path/to/a.php#" => "path/to/a.php"
 * "path/to/a/" => "path/to/a/index.js"
 * "path/to/a.js" => "path/to/a.js"
 */
var REG_JS = /\.js$/i;
var REG_SEARCH_HASH = /[?#].*$/;
function _fixPath(path, isTextPath) {
    if (isTextPath) {
        return path.replace(REG_SEARCH_HASH, '');
    }

    var index;

    if ((index = path.indexOf('?')) > -1) {
        return path.slice(0, index);
    }

    var lastChar = path.slice(-1);

    switch (lastChar) {
        case '#':
            return path.slice(0, -1);

        case '/':
            return path + 'index.js';

        default :
            return REG_JS.test(path) ? path : path + '.js';
    }
}