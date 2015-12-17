/**
 * 模块包装器
 * @author ydr.me
 * @create 2015-10-24 14:17
 */


'use strict';


var fse = require('fs-extra');
var encryption = require('ydr-utils').encryption;
var typeis = require('ydr-utils').typeis;
var dato = require('ydr-utils').dato;
var path = require('ydr-utils').path;
var string = require('ydr-utils').string;
var debug = require('ydr-utils').debug;

var minifyCSS = require('../minify/css.js');
var minifyHTML = require('../minify/html.js');
var minifyJSON = require('../minify/json.js');
var pathURI = require('../utils/path-uri.js');
var base64 = require('../utils/base64.js');
var copy = require('../utils/copy.js');
var reader = require('../utils/reader.js');
var globalId = require('../utils/global-id.js');

var REG_HUA_START = /^.*?:/;
var REG_HUA_END = /}$/;

/**
 * 生成模块 url
 * @param file {String|Null} image 的 code 为 null
 * @param options {Object} 配置
 * @param options.code {String} 模块代码
 * @param options.inType {String} 模块入口类型
 * @param options.outType {String} 模块出口类型
 * @param options.srcDirname {String} 原始根目录
 * @param options.versionLength {Number} 版本号长度
 * @param options.destCSSDirname {String} 目标 CSS 目录
 * @param options.destResourceDirname {String} 目标资源目录
 * @param options.destDirname {String} 目标目录
 * @param options.destHost {String} 目标域
 * @param options.filter {Function} 过滤器
 */
var createURL = function (file, options) {
    var code = options.code;
    var destFile = '';
    var destDirname = options.inType === 'css' ? options.destCSSDirname : options.destResourceDirname;
    var filterRet = {};
    var resList = [];

    // 直接复制
    if (code === null) {
        destFile = copy(file, {
            srcDirname: options.srcDirname,
            destDirname: destDirname,
            version: true,
            versionLength: options.versionLength,
            copyPath: false,
            logType: 1
        });
    } else {
        var extname = path.extname(file);
        var version = encryption.etag(file).slice(0, options.versionLength);

        destFile = path.join(destDirname, version + extname);

        if (code !== null && typeis.function(options.filter)) {
            filterRet = options.filter(destFile);

            if (typeis.String(filterRet)) {
                filterRet = {
                    code: filterRet
                };
            }

            code = filterRet.code;
            resList = filterRet.resList || [];
        }

        try {
            fse.outputFileSync(destFile, code, 'utf-8');
        } catch (err) {
            debug.error('write file', path.toSystem(file));
            debug.error('write file', err.message);
            process.exit(1);
        }
    }

    var uri = pathURI.toRootURL(destFile, options.destDirname);

    return {
        code: pathURI.joinURI(options.destHost, uri),
        resList: resList,
        mainList: filterRet.mainList,
        jsList: filterRet.jsList,
        cssList: filterRet.cssList
    };
};


/**
 * 包裹 define
 * @param file {String} 文件
 * @param ret {Object} 结果
 * @param ret.code {String} 代码
 * @param ret.resList {Array} 依赖资源
 * @param options {Object} 配置
 * @param options.inType {String} 模块入口类型
 * @param options.outType {String} 模块出口类型
 * @param options.srcDirname {String} 构建目录
 * @param options.destDirname {String} 目标目录
 * @param options.destCSSDirname {String} 目标 css 目录
 * @param options.destResourceDirname {String} 目标资源目录
 * @param options.destHost {String} 目标域
 * @param options.versionLength {Number} 版本号长度
 * @param [options.minifyResource] {Boolean} 是否压缩静态资源
 * @param [options.cleanCSSOptions] {Object} clean-css 配置
 * @returns {Object}
 */
var wrapDefine = function (file, ret, options) {
    if (typeis.String(ret)) {
        ret = {
            code: ret
        };
    }

    var text = ret.code;

    if (!(options.inType === 'json' && options.outType === 'js')) {
        var o = {
            o: ret.code
        };

        text = JSON.stringify(o)
            .replace(REG_HUA_START, '')
            .replace(REG_HUA_END, '');
    }

    ret.code = 'define("' + globalId.get(file, options.outType) + '",[],function(y,d,r){' +
        'r.exports=' + text + '' +
        '});';
    ret.resList = ret.resList || [];

    return ret;
};


/**
 * 合并js/css到资源列表
 * @param result
 */
var mergeRes = function (result) {
    var resList = result.resList;
    var jsList = result.jsList;
    var cssList = result.cssList;

    dato.each(cssList, function (index, item) {
        dato.each(item.dependencies, function (index, dep) {
            resList.push(dep.srcPath);
            resList = resList.concat(dep.resList);
        });
    });

    resList = resList.concat(jsList);

    return resList;
};


var defaults = {
    code: null,
    inType: 'js',
    outType: 'js',
    srcDirname: null,
    destDirname: null,
    destCSSDirname: null,
    destResourceDirname: null,
    destHost: '/',
    versionLength: 32,
    minifyResource: true,
    cleanCSSOptions: null,
    removeHTMLYUIComments: true,
    removeHTMLLineComments: true,
    joinHTMLSpaces: true,
    removeHTMLBreakLines: true,
    uglifyJSOptions: null
};


/**
 * 包裹一层 define
 * @param file {String} 文件
 * @param options {Object} 配置
 * @param [options.code] {String} 代码
 * @param options.inType {String} 模块入口类型
 * @param options.outType {String} 模块出口类型
 * @param options.srcDirname {String} 构建目录
 * @param options.destDirname {String} 目标目录
 * @param options.destJSDirname {String} 目标 JS 目录
 * @param options.destCSSDirname {String} 目标 CSS 目录
 * @param options.destResourceDirname {String} 目标资源目录
 * @param options.destHost {String} 目标域
 * @param options.versionLength {Number} 版本号长度
 * @param [options.minifyResource] {Boolean} 是否压缩静态资源
 * @param [options.cleanCSSOptions] {Object} clean-css 配置
 * @param [options.uglifyJSOptions] {Object} uglify-js 配置
 * @param [options.removeHTMLYUIComments=true] {Boolean} 是否去除 YUI 注释
 * @param [options.removeHTMLLineComments=true] {Boolean} 是否去除行注释
 * @param [options.joinHTMLSpaces=true] {Boolean} 是否合并空白
 * @param [options.removeHTMLBreakLines=true] {Boolean} 是否删除断行
 * @return {{code: String, resList: Array}}
 */
module.exports = function (file, options) {
    options = dato.extend({}, defaults, options);
    var uri;
    var extname = path.extname(file);
    var code = options.code ?
        options.code :
        (options.inType === 'image' ? null : reader(file, 'utf8'));
    var options2 = dato.extend(options, {
        code: code
    });

    switch (options.inType) {
        case 'json':
            switch (options.outType) {
                case 'url':
                    options2.filter = function () {
                        return minifyJSON(file, {
                            code: code
                        });
                    };
                    var createURLRet1 = createURL(file, options2);
                    uri = createURLRet1.code;
                    uri = pathURI.joinURI(options.destHost, uri);
                    createURLRet1.code = uri;
                    return wrapDefine(file, createURLRet1, options);

                case 'base64':
                    code = minifyJSON(file, {
                        code: code
                    });
                    code = string.toUnicode(code);
                    code = base64.string(code, extname);
                    return wrapDefine(file, code, options);

                // text
                default :
                    code = minifyJSON(file, {
                        code: code
                    });
                    return wrapDefine(file, code, options);
            }
            break;

        case 'css':
            switch (options.outType) {
                case 'url':
                    options2.filter = function () {
                        return minifyCSS(file, {
                            code: code,
                            cleanCSSOptions: options.cleanCSSOptions,
                            versionLength: options.versionLength,
                            srcDirname: options.srcDirname,
                            destDirname: options.destDirname,
                            destHost: options.destHost,
                            destResourceDirname: options.destResourceDirname,
                            destCSSDirname: options.destCSSDirname,
                            minifyResource: options.minifyResource
                        });
                    };
                    var createURLRet = createURL(file, options2);
                    uri = createURLRet.code;
                    uri = pathURI.joinURI(options.destHost, uri);
                    createURLRet.code = uri;
                    return wrapDefine(file, createURLRet, options);

                case 'base64':
                    var minifyCSSRet = minifyCSS(file, {
                        code: code,
                        cleanCSSOptions: options.cleanCSSOptions,
                        versionLength: options.versionLength,
                        srcDirname: options.srcDirname,
                        destDirname: options.destDirname,
                        destHost: options.destHost,
                        destResourceDirname: options.destResourceDirname,
                        destCSSDirname: options.destCSSDirname,
                        minifyResource: options.minifyResource
                    });
                    code = string.toUnicode(code);
                    code = base64.string(code, extname);
                    minifyCSSRet.code = code;
                    return wrapDefine(file, minifyCSSRet, options);

                // text
                default :
                    var minifyCSSRet2 = minifyCSS(file, {
                        code: code,
                        cleanCSSOptions: options.cleanCSSOptions,
                        versionLength: options.versionLength,
                        srcDirname: options.srcDirname,
                        destDirname: options.destDirname,
                        destHost: options.destHost,
                        destResourceDirname: options.destResourceDirname,
                        destCSSDirname: options.destCSSDirname,
                        minifyResource: options.minifyResource
                    });
                    return wrapDefine(file, minifyCSSRet2, options);
            }
            break;

        case 'text':
            switch (options.outType) {
                case 'url':
                    var createURLRet2 = createURL(file, options2);
                    uri = pathURI.joinURI(options.destHost, createURLRet2.code);
                    createURLRet2.code = uri;
                    return wrapDefine(file, createURLRet2, options);

                case 'base64':
                    code = string.toUnicode(code);
                    code = base64.string(code, extname);
                    return wrapDefine(file, code, options);

                // text
                default :
                    return wrapDefine(file, code, options);
            }
            break;

        case 'html':
            switch (options.outType) {
                case 'url':
                    options2.filter = function () {
                        return minifyHTML(file, {
                            code: code,
                            replaceHTMLAttrResource: true,
                            replaceHTMLTagScript: true,
                            replaceHTMLTagLink: true,
                            replaceHTMLTagStyleResource: true,
                            replaceHTMLAttrStyleResource: true,
                            replaceHTMLCoolieGroup: true,
                            removeHTMLYUIComments: options.removeHTMLYUIComments,
                            removeHTMLLineComments: options.removeHTMLLineComments,
                            joinHTMLSpaces: options.joinHTMLSpaces,
                            removeHTMLBreakLines: options.removeHTMLBreakLines,
                            srcDirname: options.srcDirname,
                            destDirname: options.destDirname,
                            destHost: options.destHost,
                            destResourceDirname: options.destResourceDirname,
                            destCSSDirname: options.destCSSDirname,
                            minifyJS: true,
                            minifyCSS: true,
                            minifyResource: true,
                            versionLength: options.versionLength,
                            uglifyJSOptions: options.uglifyJSOptions,
                            cleanCSSOptions: options.cleanCSSOptions,
                            replaceCSSResource: true
                        });
                    };
                    var createURLRet3 = createURL(file, options2);
                    uri = createURLRet3.code;
                    uri = pathURI.joinURI(options.destHost, uri);
                    createURLRet3.code = uri;
                    createURLRet3.resList = mergeRes(createURLRet3);
                    return wrapDefine(file, createURLRet3, options);

                case 'base64':
                    var minifyHTMLRet = minifyHTML(file, {
                        code: code,
                        replaceHTMLAttrResource: true,
                        replaceHTMLTagScript: true,
                        replaceHTMLTagLink: true,
                        replaceHTMLTagStyleResource: true,
                        replaceHTMLAttrStyleResource: true,
                        replaceHTMLCoolieGroup: true,
                        removeHTMLYUIComments: options.removeHTMLYUIComments,
                        removeHTMLLineComments: options.removeHTMLLineComments,
                        joinHTMLSpaces: options.joinHTMLSpaces,
                        removeHTMLBreakLines: options.removeHTMLBreakLines,
                        srcDirname: options.srcDirname,
                        destDirname: options.destDirname,
                        destHost: options.destHost,
                        destResourceDirname: options.destResourceDirname,
                        destCSSDirname: options.destCSSDirname,
                        minifyJS: true,
                        minifyCSS: true,
                        minifyResource: true,
                        versionLength: options.versionLength,
                        uglifyJSOptions: options.uglifyJSOptions,
                        cleanCSSOptions: options.cleanCSSOptions,
                        replaceCSSResource: true
                    });
                    code = string.toUnicode(code);
                    code = base64.string(code, extname);
                    minifyHTMLRet.code = code;
                    minifyHTMLRet.resList = mergeRes(minifyHTMLRet);
                    return wrapDefine(file, minifyHTMLRet, options);

                // text
                default :
                    var minifyHTMLRet2 = minifyHTML(file, {
                        code: code,
                        replaceHTMLAttrResource: true,
                        replaceHTMLTagScript: true,
                        replaceHTMLTagLink: true,
                        replaceHTMLTagStyleResource: true,
                        replaceHTMLAttrStyleResource: true,
                        replaceHTMLCoolieGroup: true,
                        removeHTMLYUIComments: options.removeHTMLYUIComments,
                        removeHTMLLineComments: options.removeHTMLLineComments,
                        joinHTMLSpaces: options.joinHTMLSpaces,
                        removeHTMLBreakLines: options.removeHTMLBreakLines,
                        srcDirname: options.srcDirname,
                        destDirname: options.destDirname,
                        destHost: options.destHost,
                        destResourceDirname: options.destResourceDirname,
                        destCSSDirname: options.destCSSDirname,
                        minifyJS: true,
                        minifyCSS: true,
                        minifyResource: true,
                        versionLength: options.versionLength,
                        uglifyJSOptions: options.uglifyJSOptions,
                        cleanCSSOptions: options.cleanCSSOptions,
                        replaceCSSResource: true
                    });
                    minifyHTMLRet2.resList = mergeRes(minifyHTMLRet2);
                    return wrapDefine(file, minifyHTMLRet2, options);
            }
            break;

        case 'image':
            switch (options.outType) {
                case 'base64':
                    code = base64.file(file);
                    return wrapDefine(file, code, options);

                // url
                default :
                    uri = createURL(file, options2);
                    return wrapDefine(file, uri, options);
            }
            break;

        default :
            debug.error('module wrapper', '`' + options.inType + '` module type is undefined');
            return process.exit(1);
    }
};


