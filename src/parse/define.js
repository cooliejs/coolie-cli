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
        // console.log();
        // throw new Error('...');
        // console.log(code);
        // debug.error('parse define', path.toSystem(file));
        // debug.error('parse define', '模块语法有误，请检查。');
        // debug.error('parse define', err.message);
        // return process.exit(1);
        // 找出 define 那一块，然后整块替换
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

            var larstArg;

            try {
                if (node.body && node.body.args) {
                    larstArg = node.body.args.slice(-1);
                } else {
                    larstArg = node.args.slice(-1);
                }

                end = larstArg[0].body[0].start.pos;
            } catch (err) {
                console.log();
                debug.error('parse error', file);
                debug.error('parse error', err.message);
                return process.exit(1);
            }
        }
    }));

    // 找出 define 那一块，然后整块替换
    return [start, end];
};



