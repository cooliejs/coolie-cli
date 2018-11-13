/**
 * 文件描述
 * @author ydr.me
 * @create 2016-05-16 10:57
 */


'use strict';

var debug = require('blear.node.debug');
var console = require('blear.node.console');

var globalId = require('../utils/global-id.js');
var parseRequireNodeList = require('./require-node-list.js');
var resolveModule = require('../utils/resolve-module');
var bookURL = require('../utils/book-url');


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
    var nodeList = parseRequireNodeList(file, {
        code: code,
        async: options.async,
        middleware: options.middleware
    });
    var coolieConfigs = options.coolieConfigs;

    if (!coolieConfigs) {
        console.log();
        debug.error('parse require', '工程中使用了模块化脚本，但配置文件里未显示声明`coolie-config.js`配置');
        process.exit(1);
    }

    nodeList.forEach(function (node) {
        var async = node.expression.property === 'async';
        var arg0 = node.args[0];
        var arg1 = node.args[1];
        var requireName = arg0.value;
        var requirePipeline = arg1 && arg1.value;

        if (!requireName) {
            console.log();
            debug.error('module file', file);
            debug.error('parse require', '该模块动态引用了其他模块，导致无法静态解析');
            debug.warn('warning', '模块路径指南 <' + bookURL('/introduction/module-path/') + '>');
            process.exit(1);
        }

        var res = resolveModule(requireName, requirePipeline, {
            file: file,
            srcDirname: options.srcDirname,
            srcNodeModulesDirname: options.srcCoolieConfigNodeModulesDirname
        });
        var requireFile = res.id;
        var name = res.name;
        var fullName = res.fullName;
        var inType = res.inType;
        var outType = res.outType;
        var nodeModule = res.nodeModule;

        if (options.middleware) {
            var meta = options.middleware.exec({
                parent: file,
                file: requireFile,
                name: name,
                fullName: fullName,
                inType: inType,
                outType: outType,
                async: async,
                nodeModule: nodeModule,
                progress: 'post-module'
            });

            requireFile = meta.file;
        }

        requireList.push({
            file: requireFile,
            id: requireFile + '|' + outType,
            name: name,
            fullName: fullName,
            outName: name + '|' + outType,
            inType: inType,
            outType: outType,
            gid: globalId.get(requireFile, outType),
            async: async,
            nodeModule: nodeModule,
            dependent: file
        });
    });

    return requireList;
};


