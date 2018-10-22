/**
 * 文件描述
 * @author ydr.me
 * @create 2018-09-11 09:50
 * @update 2018-09-11 09:50
 */


'use strict';

var path = require('blear.node.path');
var debug = require('blear.node.debug');
var console = require('blear.node.console');

var requirePipeline = require('../parse/require-pipeline.js');
var bookURL = require('./book-url');


var reAbsolute = /^\//;
var reRelative = /^\.{1,2}\//;
var pathRE = /\//;
var PACKAGE_JSON = 'package.json';


/**
 * 解析模块路径
 * @param name
 * @param pipeline
 * @param options
 * @param options.file
 * @param options.srcDirname
 * @param [options.srcNodeModulesDirname]
 * @returns {*}
 */
module.exports = function (name, pipeline, options) {
    var file = options.file;
    var fullName = name;
    var requireFile;
    var nodeModule = false;
    var pipeLine = requirePipeline(file, name, pipeline);
    var inType = pipeLine[0];
    var outType = pipeLine[1];

    // 相对于根目录
    if (reAbsolute.test(name)) {
        requireFile = path.join(options.srcDirname, name);
    }
    // 相对于当前目录
    else if (reRelative.test(name)) {
        requireFile = path.join(path.dirname(file), name);
    }
    // 相对于 node_modules 目录
    else {
        nodeModule = true;
        var nodeModuleDirname = name;
        var nodeModulePath;

        // require('node-module/path/to/module.js');
        if (pathRE.test(name)) {
            var com = name.split(pathRE);
            nodeModuleDirname = com.shift();
            nodeModulePath = com.join('/');
        }

        var srcNodeModulesDirname = options.srcNodeModulesDirname ?
            options.srcNodeModulesDirname :
            path.join(options.srcDirname, 'node_modules');
        var fromDirname = path.join(srcNodeModulesDirname, nodeModuleDirname);

        if (nodeModulePath) {
            requireFile = path.join(fromDirname, nodeModulePath);
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

            requireFile = path.join(fromDirname, reqPkg.browser || reqPkg.main || 'index.js');
        }
    }

    var extname = path.extname(requireFile);

    if (inType === 'js' && extname !== '.js') {
        requireFile += '.js';
        fullName += '.js';
    }

    return {
        id: requireFile,
        inType: inType,
        outType: outType,
        name: name,
        pipeline: pipeline,
        fullName: fullName,
        nodeModule: nodeModule
    };
};



