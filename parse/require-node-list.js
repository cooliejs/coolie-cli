/**
 * 获取 require 列表
 * @author ydr.me
 * @create 2016-05-16 14:39
 */


'use strict';


var Uglify = require("uglify-js");


module.exports = function (code, async) {
    var ast = Uglify.parse(code, {
        strict: true
    });
    var requireNodes = [];

    ast.walk(new Uglify.TreeWalker(function (node) {
        if (node instanceof Uglify.AST_Node && node.start.value === 'require' && node.args) {
            if (node.args.length === 1 || node.args.length === 2) {
                if (async && (node.expression.prototype === 'async' || node.expression.end.value === 'async')) {
                    requireNodes.push(node);
                } else if (!async && !node.expression.prototype) {
                    requireNodes.push(node);
                }
            }
        }
    }));

    return requireNodes;
};


