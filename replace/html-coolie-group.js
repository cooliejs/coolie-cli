/**
 * html coolie group
 * 合并代码、压缩代码
 * @author ydr.me
 * @create 2015-10-23 09:16
 */


'use strict';

var encryption = require('ydr-utils').encryption;

var reader = require('../utils/reader.js');
var pathURI = require('../utils/path-uri.js');
var minifyJS = require('../minify/js.js');
var minifyCSS = require('../minify/css.js');
var replaceCSSResource = require('../replace/css-resource.js');

// <!--coolie-->
var REG_COOLIE_GROUP = /<!--\s*?coolie\s*?-->([\s\S]*?)<!--\s*?\/coolie\s*?-->/gi;
// <link href>
var REG_LINK = /<link\b[\s\S]*?href\s*?=\s*?(["'])([\s\S]*?)\1/gi;
// <script src>
var REG_SCRIPT = /<script\b[\s\S]*?src\s*?=\s*?(["'])([\s\S]*?)\1/gi;
// 编码
var ENCODING = 'utf8';

/**
 * 合并 coolie 组，合并、压缩、版本控制代码
 * @param file {String} 所在的 html 文件
 * @param options {Object} 配置
 * @param options.code {String} 代码
 * @param options.minifyJS {Boolean} 是否压缩 JS
 * @param [options.uglifyJSOptions] {Object} 代码压缩配置
 * @param options.minifyCSS {Boolean} 是否压缩 CSS
 * @param [options.cleanCSSOptions] {Object} clean-css 配置
 * @param options.versionLength {Number} 版本长度
 * @param options.srcDirname {String} 构建工程原始根目录
 * @param options.destDirname {String} 目标根目录
 * @param options.destHost {String} 目标文件 URL 域
 * @param options.destResourceDirname {String} 目标资源文件保存目录
 * @param [options.destCSSFile] {String} 目标样式文件，如果存在，则相对
 * @param [options.minifyResource] {Boolean} 压缩资源文件
 * @returns {*}
 */
module.exports = function (file, options) {
    var code = options.code;

    code = code.replace(REG_COOLIE_GROUP, function (source, coolieCode) {
        var files = [];
        var bfList = [];
        var md5List = [];
        var version = '';

        // css
        if (REG_LINK.test(coolieCode)) {
            coolieCode.replace(REG_LINK, function (source, quote, href) {
                var cssFile = pathURI.toAbsoluteFile(href, file, options.srcDirname);
                var cssCode = minifyCSS(cssFile, {
                        code: reader(cssFile, ENCODING),
                        uglifyJSOptions: options.uglifyJSOptions
                    }) + '\n';

                cssCode = replaceCSSResource(cssFile, {
                    code: cssCode,
                    versionLength: options.versionLength,
                    srcDirname: options.srcDirname,
                    destDirname: options.destDirname,
                    destHost: options.destHost,
                    destResourceDirname: options.destResourceDirname,
                    minifyResource: true,
                    destCSSFile: null
                });
                md5List.push(encryption.md5(cssCode));
                bfList.push(new Buffer(cssCode, ENCODING));
            });

            version = encryption.md5(md5List.join('')).slice(0, options.versionLength);

            return '<link rel="stylesheet" src="' + version + '">';
        }
        // js
        else {
            coolieCode.replace(REG_SCRIPT, function (source, quote, src) {
                var jsFile = pathURI.toAbsoluteFile(src, file, options.srcDirname);
                var jsCode = minifyJS(jsFile, {
                        code: reader(jsFile, ENCODING),
                        uglifyJSOptions: options.uglifyJSOptions
                    }) + '\n';

                md5List.push(encryption.md5(jsCode));
                bfList.push(new Buffer(jsCode, ENCODING));
            });

            version = encryption.md5(md5List.join('')).slice(0, options.versionLength);

            return '<script src="' + version + '"></script>';
        }

    });

    return code;
};


