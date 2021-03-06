/**
 * 获取 require 列表
 * @author ydr.me
 * @create 2016-05-16 14:39
 */


'use strict';


var debug = require('blear.node.debug');
var console = require('blear.node.console');


var Uglify = require("uglify-js");
var beforeWrap = 'function parseNodeList(){\n';
var afterWrap = '\n}';
var syncCache = Object.create(null);
var asyncCache = Object.create(null);

/**
 * 语法解析
 * @param file
 * @param options
 * @param options.code
 * @param [options.async]
 * @param [options.middleware]
 * @returns {*}
 */
module.exports = function (file, options) {
    var ast;
    var code = options.code;
    var async = options.async || false;
    var cache = async ? asyncCache : syncCache;

    if (cache[file]) {
        return cache[file];
    }

    code = beforeWrap + code + afterWrap;

    try {
        ast = Uglify.parse(code);
    } catch (err) {
        console.log();
        debug.error('parse module', file);
        debug.error('parse module', '语法有误，无法解析，请检查。');
        debug.error('parse module', err.message);
        return process.exit(1);
    }

    var requireNodes = [];

    ast.walk(new Uglify.TreeWalker(function (node) {
        if (node.start.value === 'require' &&
            node.expression &&
            node.args) {
            if (node.args.length === 1 || node.args.length === 2) {
                if (async && (node.expression.property === 'async' || node.expression.end.value === 'async')) {
                    requireNodes.push(node);
                } else if (!async && !node.expression.property && !node.expression.args) {
                    requireNodes.push(node);
                }
            }
        }
    }));

    return (cache[file] = requireNodes);
};

module.exports.beforeLength = beforeWrap.length;
module.exports.afterLength = afterWrap.length;
