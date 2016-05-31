/**
 * 分析 define 信息
 * @author ydr.me
 * @create 2016-05-30 10:41
 */


'use strict';

var Uglify = require("uglify-js");
var debug = require('ydr-utils').debug;
var path = require('ydr-utils').path;

module.exports = function (file, code) {
    var start = 0;
    var end = 0;
    var ast;

    try {
        ast = Uglify.parse(code);
    } catch (err) {
        debug.error('parse define', path.toSystem(file));
        debug.error('parse define', '模块语法有误，请检查。');
        debug.error('parse define', err.message);
        return process.exit(1);
    }

    ast.walk(new Uglify.TreeWalker(function (node) {
        if (node.start.type === 'name' &&
            node.start.value === 'define' &&
            // define(id, deps, factory)
            node.body && node.body.args && node.body.args.length >= 1 && node.body.args.length <= 3) {
            start = node.start.pos;

            var larstArg = node.body.args[node.body.args.length - 1];

            end = larstArg.body[0].start.pos;
        }
    }));

    // 找出 define 那一块，然后整块替换
    return [start, end];
};



