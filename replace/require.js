/**
 * 替换 require('x')
 * @author ydr.me
 * @create 2016-05-16 12:56
 */


'use strict';

var U2 = require("uglify-js");

var requirePipeline = require('../utils/require-pipeline.js');


/**
 * 替换 require
 * @param file {String} 文件路径
 * @param options {Object} 配置
 * @param options.code {String} 代码，压缩后的代码
 * @param options.name2IdMap {Object} 依赖对应表 {outName: id}
 * @param options.async {Boolean} 是否异步模块
 */
module.exports = function (file, options) {
    var code = options.code;
    var outName2IdMap = options.name2IdMap;
    var ast = U2.parse(code, {
        strict: true
    });
    var requireNodeList = [];
    var offset = 0;

    ast.walk(new U2.TreeWalker(function (node) {
        if (node instanceof U2.AST_Node && node.start.value === 'require' && node.args) {
            if (node.args.length === 1 || node.args.length === 2) {
                if (options.async && (node.expression.prototype === 'async' || node.expression.end.value === 'async')) {
                    requireNodeList.push(node);
                } else if (!options.async && !node.expression.prototype) {
                    requireNodeList.push(node);
                }
            }
        }
    }));

    requireNodeList.forEach(function (node) {
        var arg0 = node.args[0];
        var arg1 = node.args[1];
        var async = options.async;
        var startPos = arg0.start.pos + offset;
        var endPos = arg0.start.endpos + offset;
        var name = arg0.value;
        var nameLength = name.length;
        var pipeLine;

        if (!async && arg1) {
            pipeLine = arg1.value.split('|');
            nameLength = arg1.start.endpos - arg0.start.pos - 2;
            endPos = arg1.start.endpos + offset;
        }

        pipeLine = requirePipeline(file, pipeLine);
        var outType = pipeLine[1];
        var outName =  name + '|' + outType;
        var replaceValue = outName2IdMap[outName];

        var replacement = new U2.AST_String({
            value: replaceValue,
            quote: arg0.quote
        }).print_to_string({beautify: true});

        code = code.slice(0, startPos) + replacement + code.slice(endPos);
        offset += replaceValue.length - nameLength;
    });

    return code;
};
