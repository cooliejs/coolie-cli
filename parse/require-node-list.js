/**
 * 获取 require 列表
 * @author ydr.me
 * @create 2016-05-16 14:39
 */


'use strict';


var debug = require('ydr-utils').debug;
var path = require('ydr-utils').path;

var Uglify = require("uglify-js");


module.exports = function (file, code, async) {
    var ast;

    code = 'function parseNodeList(){' + code + '}';

    try {
        ast = Uglify.parse(code);
    } catch (err) {
        console.log();
        debug.error('parse module', path.toSystem(file));
        debug.error('parse module', '语法有误，无法解析，请检查');
        debug.error('parse module', err.message);
        return process.exit(1);
    }

    var requireNodes = [];

    ast.walk(new Uglify.TreeWalker(function (node) {
        if (node instanceof Uglify.AST_Node &&
            node.start.value === 'require' &&
            node.expression && node.expression.name === 'require' &&
            node.args) {
            if (node.args.length === 1 || node.args.length === 2) {
                if (async && (node.expression.property === 'async' || node.expression.end.value === 'async')) {
                    requireNodes.push(node);
                } else if (!async && !node.expression.property) {
                    requireNodes.push(node);
                }
            }
        }
    }));

    return requireNodes;
};


