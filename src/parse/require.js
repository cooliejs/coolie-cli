/**
 * 文件描述
 * @author ydr.me
 * @create 2016-05-16 10:57
 */


'use strict';

var U2 = require("uglify-js");
var path = require('blear.node.path');
var debug = require('blear.node.debug');
var console = require('blear.node.console');


var globalId = require('../utils/global-id.js');
var pathURI = require('../utils/path-uri.js');
var requirePipeline = require('../parse/require-pipeline.js');
var parseRequireNodeList = require('./require-node-list.js');
var bookURL = require('../utils/book-url');

var PACKAGE_JSON = 'package.json';
var NODE_MODULES = 'node_modules';
var reAbsolute = /^\//;
var reRelative = /^\.{1,2}\//;
var pathRE = /\//;


/**
 * 解析 require 依赖信息
 * @param file {String} 文件地址
 * @param options {Object} 配置
 * @param options.code {String} 代码
 * @param options.async {Boolean} 是否为异步 require
 * @param options.srcDirname {String} 构建目录
 * @param options.srcCoolieConfigNodeModulesDirname {String} node_modules 根目录
 * @param options.coolieConfigs {Object} coolie-configs 配置
 * @param options.middleware
 * @returns {Array}
 */
module.exports = function (file, options) {
    var code = options.code;
    var requireList = [];
    var nodeList = parseRequireNodeList(file, code, options.async);
    var coolieConfigs = options.coolieConfigs;

    if (!coolieConfigs) {
        console.log();
        debug.error('parse require', '工程中使用了模块化脚本，但配置文件里未显示声明`coolie-config.js`配置');
        process.exit(1);
    }

    var nodeModuleMainPath = coolieConfigs.nodeModuleMainPath;
    nodeList.forEach(function (node) {
        var async = node.expression.property === 'async';
        var arg0 = node.args[0];
        var arg1 = node.args[1];
        var name = arg0.value;
        var pipeLine = requirePipeline(file, name, async ? '' : (arg1 && arg1.value || ''));
        var inType = pipeLine[0];
        var outType = pipeLine[1];
        var id;
        var nodeModule = false;

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
            // // 找到最近的 node_modules
            // var closestNodeModulesDirname = pathURI.closest(file, NODE_MODULES, options.srcDirname);
            // var fromDirname;
            //
            // if (closestNodeModulesDirname) {
            //     // // 当前模块的描述文件
            //     // var pkg = require(path.join(closestNodeModulesDirname, PACKAGE_JSON));
            //     //
            //     // pkg.dependencies = pkg.dependencies || {};
            //     // pkg.devDependencies = pkg.devDependencies || {};
            //     // pkg.peerDependencies = pkg.peerDependencies || {};
            //     //
            //     // // 从子的 node_modules 开始找
            //     // if (pkg.dependencies[name] || pkg.devDependencies[name]) {
            //     //     fromDirname = path.join(closestNodeModulesDirname, NODE_MODULES);
            //     // }
            //     // // 根目录的 node_modules 开始
            //     // else {
            //     //     fromDirname = options.srcCoolieConfigNodeModulesDirname;
            //     // }
            // }
            // // 根目录的 node_modules 开始
            // else {
            //     fromDirname = options.srcCoolieConfigNodeModulesDirname;
            // }

            nodeModule = true;
            var nodeModuleDirname = name;
            var nodeModulePath = nodeModuleMainPath;

            // require('node-module/path/to/module.js');
            if (pathRE.test(name)) {
                var com = name.split(pathRE);
                nodeModuleDirname = com.shift();
                nodeModulePath = com.join('/');
            }

            var fromDirname = path.join(options.srcCoolieConfigNodeModulesDirname, nodeModuleDirname);

            if (nodeModulePath) {
                id = path.join(fromDirname, nodeModulePath);
            } else {
                var reqPkg = {};
                var pkgJSONFile = path.join(fromDirname, PACKAGE_JSON);
                try {
                    // 依赖模块的描述文件
                    reqPkg = require(pkgJSONFile);
                } catch (err) {
                    console.log();
                    debug.error('node_module', file + '\n依赖的`' + name + '` 模块描述文件不存在或语法错误');
                    debug.error('package.json', pkgJSONFile);
                    debug.warn('warning', '模块路径指南 <' + bookURL('/introduction/module-path/') + '>');
                    return process.exit(1);
                }

                id = path.join(fromDirname, reqPkg.main || 'index.js');
            }
        }

        var extname = path.extname(id);

        if (inType === 'js' && extname !== '.js') {
            id += '.js';
        }

        requireList.push({
            file: id,
            id: id + '|' + outType,
            name: name,
            outName: name + '|' + outType,
            inType: inType,
            outType: outType,
            gid: globalId.get(id, outType),
            async: async,
            nodeModule: nodeModule,
            dependent: file
        });
    });

    return requireList;
};


