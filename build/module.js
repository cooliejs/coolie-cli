/**
 * 单模块构建
 * @author ydr.me
 * @create 2015-10-26 15:29
 */


'use strict';


var path = require('ydr-utils').path;
var dato = require('ydr-utils').dato;
var debug = require('ydr-utils').debug;
var encryption = require('ydr-utils').encryption;

var parseRequireList = require('../parse/require.js');
var reader = require('../utils/reader.js');
var globalId = require('../utils/global-id.js');
var pathURI = require('../utils/path-uri.js');
var minifyJS = require('../minify/js.js');
var replaceRequire = require('../replace/require.js');
var wrapDefine = require('../replace/wrap-define.js');
var replaceModuleWrapper = require('../replace/module-wrapper.js');

var defaults = {
    inType: 'js',
    outType: 'js',
    main: null,
    srcDirname: null,
    destDirname: null,
    destJSDirname: null,
    destCSSDirname: null,
    destResourceDirname: null,
    destHost: '/',
    versionLength: 32,
    minifyResource: true,
    uglifyJSOptions: null,
    cleanCSSOptions: null,
    htmlMinifyOptions: null,
    mute: true
};

/**
 * 构建一个模块
 * @param file {String} 模块路径
 * @param options {Object} 模块属性
 * @param options.inType {String} 模块入口类型
 * @param options.outType {String} 模块出口类型
 * @param options.file {String} 当前模块
 * @param options.main {String} 入口模块
 * @param options.parent {String} 父级模块
 * @param options.srcDirname {String} 原始根目录
 * @param options.srcCoolieConfigBaseDirname {String} base 根目录
 * @param options.srcCoolieConfigNodeModulesDirname {String} node_modules 根目录
 * @param options.destDirname {String} 目标根目录
 * @param options.destJSDirname {String} 目标 JS 目录
 * @param options.destCSSDirname {String} 目标 CSS 目录
 * @param options.destResourceDirname {String} 目标资源目录
 * @param options.destHost {String} 目标域
 * @param options.versionLength {Number} 版本号长度
 * @param options.minifyResource {Boolean} 压缩静态资源
 * @param options.uglifyJSOptions {Object} uglify-js 配置
 * @param options.cleanCSSOptions {Object} clean-css 配置
 * @param options.htmlMinifyOptions {Object} 压缩 html 配置
 * @param options.virtualMap {Object} 虚拟
 * @param options.mute {Boolean} 是否静音
 * @returns {{dependencies: Array, code: String, md5: String}}
 */
module.exports = function (file, options) {
    options = dato.extend({}, defaults, options);

    var resList = [];
    var virtualMap = options.virtualMap;
    var isJS = options.inType === 'js';

    // 读取模块内容
    var code = reader(file, 'utf8', options.parent);

    // 分析 require.async()
    var asyncRequires = isJS ? parseRequireList(file, {
        code: code,
        async: true,
        srcDirname: options.srcDirname
    }) : [];
    var asyncOutName2IdMap = {};

    dato.each(asyncRequires, function (index, item) {
        // 虚拟文件
        var replacedFile = virtualMap[item.file] || item.file;

        asyncOutName2IdMap[item.outName] = globalId.get(replacedFile, item.outType);
    });

    // 分析 require()
    var syncRequires = isJS ? parseRequireList(file, {
        code: code,
        async: false,
        srcDirname: options.srcDirname
    }) : [];
    var syncOutName2IdMap = {};
    var syncDepFileMap = {};
    var depGidList = [];
    var dependencies = [];

    dato.each(syncRequires, function (index, item) {
        syncOutName2IdMap[item.outName] = item.gid;

        if (!syncDepFileMap[item.gid]) {
            syncDepFileMap[item.gid] = true;
            depGidList.push(item.gid);
            dependencies.push({
                id: item.id,
                file: item.file,
                gid: item.gid,
                name: item.name,
                outName: item.outName,
                inType: item.inType,
                outType: item.outType
            });
        }
    });

    // 分析模块类型
    switch (options.inType) {
        case 'js':
            // 1. 替换 require.async()
            code = replaceRequire(file, {
                code: code,
                async: true,
                outName2IdMap: asyncOutName2IdMap
            });

            // 2. 替换 require()
            code = replaceRequire(file, {
                code: code,
                async: false,
                outName2IdMap: syncOutName2IdMap
            });

            // 同一个文件，不同的模块出口类型，返回的模块是不一样的
            // 例：image|js !== image|url
            var gid = options.main === file ? '0' : globalId.get(file, options.outType);

            // 3. 包裹 define()
            code = wrapDefine(file, {
                srcDirname: options.srcDirname,
                id: gid,
                deps: depGidList,
                factory: code,
                rem: true
            });

            // 4. 压缩代码
            code = minifyJS(file, {
                code: code,
                uglifyJSOptions: options.uglifyJSOptions
            });
            break;

        default:
            var replaceModuleWrapperRet = replaceModuleWrapper(file, {
                inType: options.inType,
                outType: options.outType,
                srcDirname: options.srcDirname,
                destDirname: options.destDirname,
                destJSDirname: options.destJSDirname,
                destCSSDirname: options.destCSSDirname,
                destResourceDirname: options.destResourceDirname,
                destHost: options.destHost,
                versionLength: options.versionLength,
                parent: options.parent,
                minifyResource: options.minifyResource,
                cleanCSSOptions: options.cleanCSSOptions,
                uglifyJSOptions: options.uglifyJSOptions,
                htmlMinifyOptions: options.htmlMinifyOptions,
                mute: options.mute
            });
            code = replaceModuleWrapperRet.code;
            resList = replaceModuleWrapperRet.resList;
            break;
    }

    return {
        dependencies: dependencies,
        resList: resList,
        code: code,
        md5: encryption.md5(code)
    };
};



