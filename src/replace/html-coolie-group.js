/**
 * html coolie group
 * 合并代码、压缩代码
 * @author ydr.me
 * @create 2015-10-23 09:16
 */


'use strict';

var path = require('blear.node.path');
var encryption = require('blear.node.encryption');
var debug = require('blear.node.debug');
var dato = require('ydr-utils').dato;
var fse = require('fs-extra');
var console = require('blear.node.console');
var object = require('blear.utils.object');
var collection = require('blear.utils.collection');


var reader = require('../utils/reader.js');
var sign = require('../utils/sign.js');
var pathURI = require('../utils/path-uri.js');
var minifyJS = require('../minify/js.js');
var minifyCSS = require('../minify/css.js');
var progress = require('../utils/progress.js');


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
    replaceCSSResource: true,
    signJS: false,
    signCSS: false,
    mute: false
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
 * @param [options.signJS] {Boolean} 是否签名 js 文件
 * @param [options.signCSS] {Boolean} 是否签名 css 文件
 * @param [options.mute] {Boolean} 是否静音
 * @param [options.progressKey] {String} 进度日志键
 * @param [options.middleware] {Object} 中间件
 * @returns {{code: String, cssList: Array, jsList: Array}}
 */
module.exports = function (file, options) {
    options = object.assign({}, defaults, options);
    var code = options.code;
    var cssList = [];
    var jsList = [];

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
        var cssFileResMap = {};

        // css
        if (REG_LINK.test(coolieCode)) {
            if (options.signCSS) {
                bfList.push(new Buffer(sign('css') + '\n', ENCODING));
            }

            coolieCode.replace(REG_LINK, function (source, quote, href) {
                if (options.middleware) {
                    href = options.middleware.exec({
                        file: file,
                        progress: 'pre-static',
                        type: 'css',
                        path: href
                    }).path || href;
                }

                var cssFile = pathURI.toAbsoluteFile(href, file, options.srcDirname);
                var cssCode = reader(cssFile, ENCODING, file);

                if (options.minifyCSS) {
                    var minifyCSSRet = minifyCSS(cssFile, {
                        code: cssCode,
                        cleanCSSOptions: options.cleanCSSOptions,
                        versionLength: options.versionLength,
                        srcDirname: options.srcDirname,
                        destDirname: options.destDirname,
                        destHost: options.destHost,
                        destResourceDirname: options.destResourceDirname,
                        destCSSDirname: options.destCSSDirname,
                        minifyResource: options.minifyResource,
                        replaceCSSResource: options.replaceCSSResource,
                        mute: options.mute,
                        middleware: options.middleware
                    });
                    cssCode = minifyCSSRet.code + '\n';
                    cssFileResMap[cssFile] = minifyCSSRet.resList;
                }

                files.push(cssFile);
                md5List.push(encryption.md5(cssCode));
                bfList.push(new Buffer(cssCode, ENCODING));
                var url = pathURI.toRootURL(cssFile, options.srcDirname);

                if (!options.mute) {
                    debug.success('build css', url);
                }

                if (options.progressKey) {
                    progress.run(options.progressKey, url);
                }
            });

            findCache = hasCache(files);

            if (findCache > -1) {
                return cacheResultList[findCache];
            }

            version = encryption.md5(md5List.join('')).slice(0, options.versionLength);
            concatFile = path.join(options.destCSSDirname, version + '.css');
            concatURI = pathURI.toRootURL(concatFile, options.destDirname);
            cssList.push({
                destPath: concatFile,
                dependencies: files.map(function (file) {
                    return {
                        srcPath: file,
                        resList: cssFileResMap[file]
                    };
                })
            });

            try {
                fse.outputFileSync(concatFile, Buffer.concat(bfList));
            } catch (err) {
                debug.error('write css', concatFile);
                debug.error('write css', err.message);
                return process.exit(1);
            }

            concatRet = '<link rel="stylesheet" href="' + pathURI.joinHost('css', options.destHost, concatURI) + '">';
            cacheFilesList.push(files);
            cacheResultList.push(concatRet);

            return concatRet;
        }
        // js
        else {
            if (options.signJS) {
                bfList.push(new Buffer(sign('js') + '\n', ENCODING));
            }

            coolieCode.replace(REG_SCRIPT, function (source, quote, src) {
                if (options.middleware) {
                    src = options.middleware.exec({
                        file: file,
                        progress: 'pre-static',
                        type: 'js',
                        path: src
                    }).path || src;
                }

                var jsFile = pathURI.toAbsoluteFile(src, file, options.srcDirname);
                var jsCode = reader(jsFile, ENCODING, file);

                if (options.minifyJS) {
                    jsCode = minifyJS(jsFile, {
                            code: jsCode,
                            uglifyJSOptions: options.uglifyJSOptions,
                            mute: options.mute
                        }) + '\n';
                }

                files.push(jsFile);
                md5List.push(encryption.md5(jsCode));
                bfList.push(new Buffer(jsCode, ENCODING));
                var url = pathURI.toRootURL(jsFile, options.srcDirname);

                if (!options.mute) {
                    debug.success('build js', url);
                }

                if (options.progressKey) {
                    progress.run(options.progressKey, url);
                }
            });

            findCache = hasCache(files);

            if (findCache > -1) {
                return cacheResultList[findCache];
            }

            version = encryption.md5(md5List.join('')).slice(0, options.versionLength);
            concatFile = path.join(options.destJSDirname, version + '.js');
            concatURI = pathURI.toRootURL(concatFile, options.destDirname);
            jsList.push({
                destPath: concatFile,
                dependencies: files
            });

            try {
                fse.outputFileSync(concatFile, Buffer.concat(bfList));
            } catch (err) {
                debug.error('write js', concatFile);
                debug.error('write js', err.message);
                return process.exit(1);
            }

            concatRet = '<script src="' + pathURI.joinHost('js', options.destHost, concatURI) + '"></script>';
            cacheFilesList.push(files);
            cacheResultList.push(concatRet);

            return concatRet;
        }
    });

    return {
        code: code,
        jsList: jsList,
        cssList: cssList
    };
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

    collection.each(cacheFilesList, function (index, cache) {
        var compare = dato.compare(cache, files);

        // 没有不同 && 没有独有
        if (!compare.different.length && !compare.only[0].length && !compare.only[1].length) {
            find = index;
            return false;
        }
    });

    return find;
}

