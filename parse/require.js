/**
 * 文件描述
 * @author ydr.me
 * @create 2016-05-16 10:57
 */


'use strict';

var U2 = require("uglify-js");
var path = require('ydr-utils').path;
var debug = require('ydr-utils').debug;

var globalId = require('../utils/global-id.js');
var pathURI = require('../utils/path-uri.js');
var requirePipeline = require('../utils/require-pipeline.js');
var parseRequireNodeList = require('./require-node-list.js');

var PACKAGE_JSON = 'package.json';
var NODE_MODULES = 'node_modules';
var reAbsolute = /^\//;
var reRelative = /^\.{1,2}\//;


/**
 * 解析 require 依赖信息
 * @param file {String} 文件地址
 * @param options {Object} 配置
 * @param options.code {String} 代码
 * @param options.async {Boolean} 是否为异步 require
 * @param options.srcDirname {String} 构建目录
 * @returns {Array}
 */
module.exports = function (file, options) {
    var code = options.code;
    var requireList = [];
    var nodeList = parseRequireNodeList(code, options.async);
    var parser = function (node) {
        var async = node.expression.property === 'async';
        var arg0 = node.args[0];
        var arg1 = node.args[1];
        var pipeLine = requirePipeline(file, async ? '' : (arg1 && arg1.value || ''));
        var inType = pipeLine[0];
        var outType = pipeLine[1];
        var name = arg0.value;
        var id;

        // 相对于根目录
        if (reAbsolute.test(name)) {
            id = path.join(options.srcDirname, name);
        }
        // 相对于当前目录
        else if (reRelative.test(name)) {
            id = path.join(path.dirname(file), name);
        }
        // 相对于 node_modules 目录
        else {
            // 找到最近的 node_modules
            var closestNodeModulesDirname = pathURI.closest(file, NODE_MODULES, options.srcDirname);
            var fromDirname;

            if (closestNodeModulesDirname) {
                // 当前模块的描述文件
                var pkg = require(path.join(closestNodeModulesDirname, PACKAGE_JSON));

                pkg.dependencies = pkg.dependencies || {};
                pkg.devDependencies = pkg.devDependencies || {};
                pkg.peerDependencies = pkg.peerDependencies || {};

                if (pkg.dependencies[name] || pkg.devDependencies[name]) {
                    fromDirname = path.join(closestNodeModulesDirname, NODE_MODULES);
                } else {
                    fromDirname = path.join(options.srcDirname, NODE_MODULES);
                }
            } else {
                fromDirname = path.join(options.srcDirname, NODE_MODULES);
            }

            // 依赖模块的描述文件
            var reqPkg = require(path.join(fromDirname, name, PACKAGE_JSON));
            var main = reqPkg.main || 'index.js';
            id = path.join(fromDirname, main);
        }

        requireList.push({
            file: id,
            id: id + '|' + outType,
            name: name,
            outName: name + '|' + outType,
            inType: inType,
            outType: outType,
            gid: globalId.get(id, outType),
            async: async
        });
    };

    nodeList.forEach(parser);
    
    return requireList;
};


