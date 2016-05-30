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
    var hasDefine = false;
    var first = true;
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
        if (first && node.TYPE === 'Toplevel' && node.start.type === 'name' && node.start.value === 'define') {
            hasDefine = true;
            start = node.start.pos;
            end = node.end.endpos;
        }

        first = false;
    }));

    if (!hasDefine) {
        return code;
    }

};



