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

/**
 * 合并 coolie 组，合并、压缩、版本控制代码
 * @param file {String} 所在的 html 文件
 * @param options {Object} 配置
 * @param options.code {String} 代码
 * @param options.minifyJS {Boolean} 是否压缩 JS
 * @param [options.uglifyJSOptions] {Object} 代码压缩配置
 * @param options.destJSDirname {String} 目标 JS 文件目录
 * @param options.minifyCSS {Boolean} 是否压缩 CSS
 * @param [options.cleanCSSOptions] {Object} clean-css 配置
 * @param options.versionLength {Number} 版本长度
 * @param options.srcDirname {String} 构建工程原始根目录
 * @param options.destDirname {String} 目标根目录
 * @param options.destHost {String} 目标文件 URL 域
 * @param options.destResourceDirname {String} 目标资源文件保存目录
 * @param options.destCSSDirname {String} 目标 CSS 文件目录
 * @param [options.minifyResource] {Boolean} 压缩资源文件
 * @returns {*}
 */
module.exports = function (file, options) {
    var code = options.code;

    code = code.replace(REG_COOLIE_GROUP, function (source, coolieCode) {
        var files = [];
        var bfList = [];
        var md5List = [];
        var findCache = -1;
        var version = '';
        var concatFile = '';
        var concatURI = '';
        var concatRet = '';

        // css
        if (REG_LINK.test(coolieCode)) {
            coolieCode.replace(REG_LINK, function (source, quote, href) {
                var cssFile = pathURI.toAbsoluteFile(href, file, options.srcDirname);
                var cssCode = minifyCSS(cssFile, {
                        code: reader(cssFile, ENCODING),
                        uglifyJSOptions: options.uglifyJSOptions,
                        versionLength: options.versionLength,
                        srcDirname: options.srcDirname,
                        destDirname: options.destDirname,
                        destHost: options.destHost,
                        destResourceDirname: options.destResourceDirname,
                        destCSSDirname: options.destCSSDirname,
                        minifyResource: options.minifyResource
                    }) + '\n';

                files.push(cssFile);
                md5List.push(encryption.md5(cssCode));
                bfList.push(new Buffer(cssCode, ENCODING));
            });

            findCache = hasCache(files);

            if (findCache > -1) {
                return cacheResultList[findCache];
            }

            version = encryption.md5(md5List.join('')).slice(0, options.versionLength);
            concatFile = path.join(pathURI.toURIPath(options.destCSSDirname), version + '.css');
            concatURI = pathURI.toRootURL(concatFile, options.destDirname);

            try {
                fse.outputFileSync(concatFile, Buffer.concat(bfList));
                debug.success('√', concatURI);
            } catch (err) {
                debug.error('write css', path.toSystem(concatFile));
                debug.error('write css', err.message);
            }

            concatRet = '<link rel="stylesheet" src="' + concatURI + '">';
            cacheFilesList.push(files);
            cacheResultList.push(concatRet);

            return concatRet;
        }
        // js
        else {
            coolieCode.replace(REG_SCRIPT, function (source, quote, src) {
                var jsFile = pathURI.toAbsoluteFile(src, file, options.srcDirname);
                var jsCode = minifyJS(jsFile, {
                        code: reader(jsFile, ENCODING),
                        uglifyJSOptions: options.uglifyJSOptions
                    }) + '\n';

                files.push(jsFile);
                md5List.push(encryption.md5(jsCode));
                bfList.push(new Buffer(jsCode, ENCODING));
            });

            findCache = hasCache(files);

            if (findCache > -1) {
                return cacheResultList[findCache];
            }

            version = encryption.md5(md5List.join('')).slice(0, options.versionLength);
            concatFile = path.join(pathURI.toURIPath(options.destJSDirname), version + '.js');
            concatURI = pathURI.toRootURL(concatFile, options.destDirname);

            try {
                fse.outputFileSync(concatFile, Buffer.concat(bfList));
                debug.success('√', concatURI);
            } catch (err) {
                debug.error('write css', path.toSystem(concatFile));
                debug.error('write css', err.message);
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

