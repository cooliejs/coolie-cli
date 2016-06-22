/**
 * cmd 模块转换为 cjs 模式
 * @author ydr.me
 * @create 2016-05-27 22:27
 */


'use strict';


var Uglify = require("uglify-js");
var console = require('blear.node.console');


module.exports = function (file, options) {
    var code = options.code;
    var ast;

    try {
        ast = Uglify.parse(code);
    } catch (err) {
        return code;
    }

    var hasDefine = false;
    var first = true;
    var start = 0;
    var end = 0;

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

    var code2 = code.slice(start, end);

    start = code2.indexOf('{');
    code2 = code2.slice(start + 1);
    end = code2.lastIndexOf('}');
    code2 = code2.slice(0, end);

    return code2;
};


