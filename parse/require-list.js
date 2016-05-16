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


var PACKAGE_JSON = 'package.json';
var NODE_MODULES = 'node_modules';
var reAbsolute = /^\//;
var reRelative = /^\.{1,2}\//;
/**
 * 模块入口类型
 * @type {{}}
 */
var moduleInTypeMap = {
    js: 'js',
    image: 'file',
    file: 'file',
    text: 'text',
    html: 'text',
    json: 'json',
    css: 'css'
};

/**
 * 模块出口类型
 * @type {{}}
 */
var moduleOutTypeMap = {
    js: {
        js: 1,
        d: 'js'
    },
    file: {
        url: 1,
        base64: 1,
        d: 'url'
    },
    text: {
        text: 1,
        url: 2,
        base64: 2,
        d: 'text'
    },
    css: {
        text: 1,
        url: 2,
        base64: 2,
        style: 3,
        d: 'text'
    },
    json: {
        js: 1,
        text: 2,
        url: 3,
        base64: 3,
        d: 'js'
    }
};

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
    var ast = U2.parse(code, {
        strict: true
    });
    var requireList = [];
    var parser = function (node) {
        var async = node.expression.property === 'async';
        var arg0 = node.args[0];
        var arg1 = node.args[1];
        var pipeLine = (arg1 && !async ? arg1.value : 'js|js').split('|');
        var inType = pipeLine[0];
        var outType = pipeLine[1];
        var name = arg0.value;
        var id;

        inType = moduleInTypeMap[inType];


        if (!inType) {
            debug.error('错误', '不支持的入口类型：' + inType + '\n' + path.toSystem(file));
            return process.exit(1);
        }

        var dfnOutType = moduleOutTypeMap[inType];
        outType = dfnOutType[outType] ? outType : dfnOutType.d;

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
            inType: inType,
            outType: outType,
            gid: globalId.get(id, outType),
            async: async
        });
    };

    ast.walk(new U2.TreeWalker(function (node) {
        if (node instanceof U2.AST_Node && node.start.value === 'require' && node.args) {
            if (node.args.length === 1 || node.args.length === 2) {
                if (options.async && node.expression.property === 'async') {
                    parser(node);
                } else if (!options.async && !node.expression.prototype) {
                    parser(node);
                }
            }
        }
    }));

    return requireList;
};


