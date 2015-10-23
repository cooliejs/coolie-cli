/**
 * html attr script replace
 * @author ydr.me
 * @create 2015-10-22 18:41
 */


'use strict';

var dato = require('ydr-utils').dato;

var htmlAttr = require('../utils/html-attr.js');
var minifyJS = require('../minify/js.js');

var JS_TYPES = [
    'javascript',
    'text/javascript',
    'text/ecmascript',
    'text/ecmascript-6',
    'text/jsx',
    'application/javascript',
    'application/ecmascript'
];
var COOLIE_IGNORE = 'coolieignore';
var REG_SCRIPT = /(<script\b[\s\S]*?>)([\s\S]*?)<\/script>/ig;
// 有歧义的代码片段
var REG_AMBIGUITY_SLICE = /}};?<\/script>$/;



/**
 * 替换 html script
 * @param file {String} 文件
 * @param options {Object} 配置
 * @param options.code {String} 代码
 * @returns {*}
 */
module.exports = function (file, options) {
    var code = options.code;

    code = code.replace(REG_SCRIPT, function (source, scriptTag, scriptCode) {
        var ignore = htmlAttr.get(source, COOLIE_IGNORE);

        if (ignore) {
            source = htmlAttr.remove(source, COOLIE_IGNORE);
            return source;
        }

        var type = htmlAttr.get(scriptTag, 'type');
        var find = !type;

        if (!find) {
            dato.each(JS_TYPES, function (index, _type) {
                if (type === _type) {
                    find = true;
                    return false;
                }
            });
        }

        if (find) {
            scriptCode = minifyJS(file, {
                code: scriptCode
            });
        }

        var ret =  scriptTag + scriptCode + '</script>';

        return ret.replace(REG_AMBIGUITY_SLICE, '}/**/}</script>');
    });

    return code;
};
