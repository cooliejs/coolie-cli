/**
 * html coolie group
 * 合并代码、压缩代码
 * @author ydr.me
 * @create 2015-10-23 09:16
 */


'use strict';

var path = require('ydr-utils').path;
var encryption = require('ydr-utils').encryption;
var debug = require('ydr-utils').debug;
var dato = require('ydr-utils').dato;
var fse = require('fs-extra');

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
// 缓存
var cacheFilesList = [];
// 结果缓存
var cacheResultList = [];
var defaults = {
    code: '',
    destJSDirname: null,
    versionLength: 32,
    srcDirname: null,
    destDirname: null,
    destHost: '/',
    destResourceDirname: null,
    destCSSDirname: null,
    minifyResource: true,
    minifyJS: true,
    uglifyJSOptions: null,
    minifyCSS: true,
    cleanCSSOptions: true,
    replaceCSSResource: true
};


/**
 * 合并 coolie 组，合并、压缩、版本控制代码
 * @param file {String} 所在的 html 文件
 * @param options {Object} 配置
 * @param options.code {String} 代码
 * @param options.destJSDirname {String} 目标 JS 文件目录
 * @param options.versionLength {Number} 版本长度
 * @param options.srcDirname {String} 构建工程原始根目录
 * @param options.destDirname {String} 目标根目录
 * @param options.destHost {String} 目标文件 URL 域
 * @param options.destResourceDirname {String} 目标资源文件保存目录
 * @param options.destCSSDirname {String} 目标 CSS 文件目录
 * @param [options.minifyResource] {Boolean} 压缩资源文件
 * @param [options.minifyJS] {Boolean} 是否压缩 JS
 * @param [options.uglifyJSOptions] {Object} uglify-js 配置
 * @param [options.minifyCSS] {Boolean} 是否压缩 CSS
 * @param [options.cleanCSSOptions] {Object} clean-css 配置
 * @param [options.replaceCSSResource] {Boolean} 是否替换 CSS 内引用资源
 * @returns {*}
 */
module.exports = function (file, options) {
    options = dato.extend({}, defaults, options);
    var code = options.code;

    code = code.replace(REG_COOLIE_GROUP, function (source, coolieCode) {
        var files = [];
        var bfList = [];
        var md5List = [];
        var findCache = -1;
        var version = '';
        // 合并后的文件
        var concatFile = '';
        // 合并后的 uri
        var concatURI = '';
        // 合并结果
        var concatRet = '';


        // css
        if (REG_LINK.test(coolieCode)) {
            coolieCode.replace(REG_LINK, function (source, quote, href) {
                var cssFile = pathURI.toAbsoluteFile(href, file, options.srcDirname);
                var cssCode = reader(cssFile, ENCODING);

                if (options.minifyCSS) {
                    cssCode = minifyCSS(cssFile, {
                            code: cssCode,
                            cleanCSSOptions: options.cleanCSSOptions,
                            replaceCSSResource: false
                        }) + '\n';
                }

                if (options.replaceCSSResource) {
                    cssCode = replaceCSSResource(cssFile, {
                        code: cssCode,
                        versionLength: options.versionLength,
                        srcDirname: options.srcDirname,
                        destDirname: options.destDirname,
                        destHost: options.destHost,
                        destResourceDirname: options.destResourceDirname,
                        destCSSDirname: options.destCSSDirname,
                        minifyResource: options.minifyResource,
                        returnObject: false
                    });
                }

                files.push(cssFile);
                md5List.push(encryption.md5(cssCode));
                bfList.push(new Buffer(cssCode, ENCODING));
            });

            findCache = hasCache(files);

            if (findCache > -1) {
                return cacheResultList[findCache];
            }

            version = encryption.md5(md5List.join('')).slice(0, options.versionLength);
            concatFile = path.join(path.toURI(options.destCSSDirname), version + '.css');
            concatURI = pathURI.toRootURL(concatFile, options.destDirname);

            try {
                fse.outputFileSync(concatFile, Buffer.concat(bfList));
                debug.success('√', concatURI);
            } catch (err) {
                debug.error('write css', path.toSystem(concatFile));
                debug.error('write css', err.message);
                return process.exit(1);
            }

            concatRet = '<link rel="stylesheet" href="' + concatURI + '">';
            cacheFilesList.push(files);
            cacheResultList.push(concatRet);

            return concatRet;
        }
        // js
        else {
            coolieCode.replace(REG_SCRIPT, function (source, quote, src) {
                var jsFile = pathURI.toAbsoluteFile(src, file, options.srcDirname);
                var jsCode = reader(jsFile, ENCODING);

                if (options.minifyJS) {
                    jsCode = minifyJS(jsFile, {
                            code: jsCode,
                            uglifyJSOptions: options.uglifyJSOptions
                        }) + '\n';
                }

                files.push(jsFile);
                md5List.push(encryption.md5(jsCode));
                bfList.push(new Buffer(jsCode, ENCODING));
            });

            findCache = hasCache(files);

            if (findCache > -1) {
                return cacheResultList[findCache];
            }

            version = encryption.md5(md5List.join('')).slice(0, options.versionLength);
            concatFile = path.join(path.toURI(options.destJSDirname), version + '.js');
            concatURI = pathURI.toRootURL(concatFile, options.destDirname);

            try {
                fse.outputFileSync(concatFile, Buffer.concat(bfList));
                debug.success('√', concatURI);
            } catch (err) {
                debug.error('write js', path.toSystem(concatFile));
                debug.error('write js', err.message);
                return process.exit(1);
            }

            concatRet = '<script src="' + concatURI + '"></script>';
            cacheFilesList.push(files);
            cacheResultList.push(concatRet);

            return concatRet;
        }
    });

    return code;
};


/**
 * 获取缓存信息
 * @returns {Array}
 */
module.exports.getCache = function () {
    return cacheFilesList;
};


/**
 * 判断是否命中缓存
 * @param files
 * @returns {Number}
 */
function hasCache(files) {
    var find = -1;

    dato.each(cacheFilesList, function (index, cache) {
        var compare = dato.compare(cache, files);

        // 没有不同 && 没有独有
        if (!compare.different.length && !compare.only[0].length && !compare.only[1].length) {
            find = index;
            return false;
        }
    });

    return find;
}

