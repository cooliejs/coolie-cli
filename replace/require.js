/**
 * 替换 require('x')
 * @author ydr.me
 * @create 2016-05-16 12:56
 */


'use strict';

var Uglify = require("uglify-js");

var requirePipeline = require('../utils/require-pipeline.js');
var parseRequireNodeList = require('../parse/require-node-list.js');


/**
 * 替换 require
 * @param file {String} 文件路径
 * @param options {Object} 配置
 * @param options.code {String} 代码，压缩后的代码
 * @param options.outName2IdMap {Object} 依赖对应表 {outName: id}
 * @param options.async {Boolean} 是否异步模块
 */
module.exports = function (file, options) {
    var code = options.code;
    var outName2IdMap = options.outName2IdMap;
    var requireNodeList = parseRequireNodeList(code, options.async);
    var offset = 0;

    requireNodeList.forEach(function (node) {
        var arg0 = node.args[0];
        var arg1 = node.args[1];
        var async = options.async;
        var startPos = arg0.start.pos + offset;
        var endPos = arg0.start.endpos + offset;
        var name = arg0.value;
        var nameLength = name.length;
        var pipeLine =requirePipeline(async ? '' : (arg1 && arg1.value || ''));
        var outType = pipeLine[1];
        var outName =  name + '|' + outType;
        var replaceValue = outName2IdMap[outName];
        var replacement = new Uglify.AST_String({
            value: replaceValue,
            quote: arg0.quote
        }).print_to_string({beautify: true});

        if (!async && arg1) {
            nameLength = arg1.start.endpos - arg0.start.pos - 2;
            endPos = arg1.start.endpos + offset;
        }

        code = code.slice(0, startPos) + replacement + code.slice(endPos);
        offset += replaceValue.length - nameLength;
    });

    return code;
};
