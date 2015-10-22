/**
 * html style resource
 * @author ydr.me
 * @create 2015-10-22 17:41
 */


'use strict';

var debug = require('ydr-utils').debug;
var path = require('ydr-utils').path;

var htmlAttr = require('../utils/html-attr.js');
var replaceCSSResource = require('./css-resource.js');
var minifyCSS = require('../minify/css.js');

var COOLIE_IGNOE = 'coolieignore';
var REG_STYLE_TAG = /(<style\b[\s\S]*?>)([\s\S]*?)<\/style>/ig;
var STYLE_TAG_TYPE = 'text/css';
var REG_TAG = /<([a-z][a-z\d]*)\b([\s\S]*?)style\s*?=\s*?(["'])([\s\S]*?)\3([\s\S]*?)>/gi;
var REG_LINES = /[\n\r]/g;
var REG_SPACES = /\s+/g;

/**
 * 替换 html style 资源
 * @param file {String} 文件
 * @param options {Object} 配置
 * @param options.code {String} 代码
 * @param options.versionLength {Number} 版本长度
 * @param options.srcDirname {String} 构建工程原始根目录
 * @param options.destDirname {String} 目标根目录
 * @param options.destHost {String} 目标文件 URL 域
 * @param options.destResourceDirname {String} 目标资源文件保存目录
 * @param [options.minifyCSS] {Boolean} 是否压缩 css
 * @param [options.minifyResource] {Boolean} 压缩资源文件
 */
module.exports = function (file, options) {
    var code = options.code;

    // <style...>
    code = code.replace(REG_STYLE_TAG, function (source, styleTag, styleCode) {
        source = htmlAttr.remove(styleTag, COOLIE_IGNOE);
        var ignore = htmlAttr.get(styleTag, COOLIE_IGNOE);

        if (ignore) {
            return source;
        }

        var type = htmlAttr.get(styleTag, 'type');

        // 未配置 type 属性 || type 属性标准
        if (!type || type === STYLE_TAG_TYPE) {
            styleCode = replaceCSSResource(file, {
                code: styleCode,
                destCSSFile: null,
                versionLength: options.versionLength,
                srcDirname: options.srcDirname,
                destDirname: options.destDirname,
                destHost: options.destHost,
                destResourceDirname: options.destResourceDirname
            });

            if (options.minifyCSS) {
                styleCode = minifyCSS(file, {
                    code: styleCode
                });
            }
        }

        return styleTag + styleCode + '</style>';
    });

    // style=""
    code = code.replace(REG_TAG, function (source, tagName, before, quote, styleCode, after) {
        source = htmlAttr.remove(source, COOLIE_IGNOE);
        var ignore = htmlAttr.get(source, COOLIE_IGNOE);

        if (ignore) {
            return source;
        }

        styleCode = replaceCSSResource(file, {
            code: styleCode,
            destCSSFile: null,
            versionLength: options.versionLength,
            srcDirname: options.srcDirname,
            destDirname: options.destDirname,
            destHost: options.destHost,
            destResourceDirname: options.destResourceDirname
        });

        if (options.minifyCSS) {
            styleCode = styleCode.replace(REG_LINES, '').replace(REG_SPACES, ' ');
        }

        return '<' + tagName + before + 'style=' + quote + styleCode + quote + after + '>';
    });

    return code;
};



