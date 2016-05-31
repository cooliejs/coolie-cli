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
        if (node.start.type === 'name' &&
            node.start.value === 'define' &&
            // define(id, deps, factory)
            node.body && node.body.args && node.body.args.length >= 1 && node.body.args.length <= 3) {
            hasDefine = true;
            start = node.start.pos;

            var larstArg = node.body.args[node.body.args.length - 1];

            if (!larstArg.argnames) {
                debug.error('parse define', path.toSystem(file));
                debug.error('parse define', '兼容模式下，解析模块出错，define(factory) 不匹配。\n' +
                    '为了避免错误，请修改模块为 CommonJS 规范，并将模块加载器配置文件的 mode 修改为 `CJS`');
                process.exit(1);
            }

            var larstArgName = larstArg.argnames[larstArg.argnames.length - 1];

            end = larstArgName.end.endpos;
        }
    }));

    // 找出 define 那一块，然后整块替换
    return [start, end];
};



