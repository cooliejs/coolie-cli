/**
 * 分析 define 信息
 * @author ydr.me
 * @create 2016-05-30 10:41
 */


'use strict';

var Uglify = require("uglify-js");
var debug = require('blear.node.debug');
var path = require('ydr-utils').path;
var console = require('blear.node.console');


module.exports = function (file, code) {
    var start = 0;
    var end = 0;
    var ast;

    try {
        ast = Uglify.parse(code);
    } catch (err) {
        return [start, end];
    }

    ast.walk(new Uglify.TreeWalker(function (node) {
        if (node.start.type === 'name' &&
            node.start.value === 'define' &&
            // define(id, deps, factory)
            (
                node.body && node.body.args && node.body.args.length >= 1 && node.body.args.length <= 3 ||
                node.args && node.args.length >= 1 && node.args.length <= 3
            )) {
            start = node.start.pos;

            var lastArg;

            try {
                if (node.body && node.body.args) {
                    lastArg = node.body.args.slice(-1);
                } else {
                    lastArg = node.args.slice(-1);
                }

                end = lastArg[0].body[0].start.pos;
            } catch (err) {
                //;
            }
        }
    }));

    // 找出 define 那一块，然后整块替换
    return [start, end];
};



