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

var parseCMDRequire = require('../parse/cmd-require.js');
var reader = require('../utils/reader.js');
var globalId = require('../utils/global-id.js');
var pathURI = require('../utils/path-uri.js');
var minifyJS = require('../minify/js.js');
var replaceAMDRequire = require('../replace/amd-require.js');
var replaceAMDDefine = require('../replace/amd-define.js');
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
    removeHTMLYUIComments: true,
    removeHTMLLineComments: true,
    joinHTMLSpaces: true,
    removeHTMLBreakLines: true
};

/**
 * 构建一个模块
 * @param file {String} 模块路径
 * @param options {Object} 模块属性
 * @param options.inType {String} 模块入口类型
 * @param options.outType {String} 模块出口类型
 * @param options.main {String} 入口模块
 * @param options.parent {String} 父级模块
 * @param options.srcDirname {String} 原始根目录
 * @param options.destDirname {String} 目标根目录
 * @param options.destJSDirname {String} 目标 JS 目录
 * @param options.destCSSDirname {String} 目标 CSS 目录
 * @param options.destResourceDirname {String} 目标资源目录
 * @param options.destHost {String} 目标域
 * @param options.versionLength {Number} 版本号长度
 * @param options.minifyResource {Boolean} 压缩静态资源
 * @param options.uglifyJSOptions {Object} uglify-js 配置
 * @param options.cleanCSSOptions {Object} clean-css 配置
 * @param [options.removeHTMLYUIComments=true] {Boolean} 是否去除 YUI 注释
 * @param [options.removeHTMLLineComments=true] {Boolean} 是否去除行注释
 * @param [options.joinHTMLSpaces=true] {Boolean} 是否合并空白
 * @param [options.removeHTMLBreakLines=true] {Boolean} 是否删除断行
 * @returns {void} | {{dependencies: Array, code: String, md5: String}}
 */
module.exports = function (file, options) {
    options = dato.extend({}, defaults, options);

    // 读取模块内容
    try {
        var code = reader(file, 'utf8');
    } catch (err) {
        debug.error('main module', path.toSystem(options.main));
        debug.error('parent module', path.toSystem(options.parent));
        process.exit(1);
    }

    //[{ id: '/Users/cloudcome/development/github/nodejs-coolie/example/src/static/js/libs1/path1/path2/index.js|js',
    //file: '/Users/cloudcome/development/github/nodejs-coolie/example/src/static/js/libs1/path1/path2/index.js',
    //gid: '1',
    //raw: '../libs1/path1/path2/',
    //name: '../libs1/path1/path2/index.js',
    //inType: 'js',
    //outType: 'js' }]

    // 分析 require.async()
    var asyncRequires = parseCMDRequire(file, {
        code: code,
        async: true
    });
    var asyncName2IdMap = {};

    dato.each(asyncRequires, function (index, item) {
        asyncName2IdMap[item.raw] = item.gid;
    });


    // 分析 require()
    var syncRequires = parseCMDRequire(file, {
        code: code,
        async: false
    });
    var syncName2IdMap = {};
    var syncDepFileMap = {};
    var depGidList = [];
    var dependencies = [];

    dato.each(syncRequires, function (index, item) {
        syncName2IdMap[item.raw] = item.gid;

        if (!syncDepFileMap[item.gid]) {
            syncDepFileMap[item.gid] = true;
            depGidList.push(item.gid);
            dependencies.push({
                id: item.id,
                file: item.file,
                gid: item.gid,
                raw: item.raw,
                name: item.name,
                inType: item.inType,
                outType: item.outType
            });
        }
    });


    // 分析模块类型
    switch (options.inType) {
        case 'js':
            // 1. 压缩代码
            code = minifyJS(file, {
                code: code,
                uglifyJSOptions: options.uglifyJSOptions
            });

            // 2. 替换 require.async()
            code = replaceAMDRequire(file, {
                code: code,
                async: true,
                name2IdMap: asyncName2IdMap
            });

            // 3. 替换 require()
            code = replaceAMDRequire(file, {
                code: code,
                async: false,
                name2IdMap: syncName2IdMap
            });

            // 同一个文件，不同的模块出口类型，返回的模块是不一样的
            // 例：image|js !== image|url
            var gid = options.main === file ? '0' : globalId.get(file, options.outType);
            // 4. 替换 define()
            code = replaceAMDDefine(file, {
                code: code,
                gid: gid,
                depGidList: depGidList
            });
            break;

        default:
            code = replaceModuleWrapper(file, {
                inType: options.inType,
                outType: options.outType,
                srcDirname: options.srcDirname,
                destDirname: options.destDirname,
                destJSDirname: options.destJSDirname,
                destCSSDirname: options.destCSSDirname,
                destResourceDirname: options.destResourceDirname,
                destHost: options.destHost,
                versionLength: options.versionLength,
                minifyResource: options.minifyResource,
                cleanCSSOptions: options.cleanCSSOptions,
                uglifyJSOptions: options.uglifyJSOptions,
                removeHTMLYUIComments: options.removeHTMLYUIComments,
                removeHTMLLineComments: options.removeHTMLLineComments,
                joinHTMLSpaces: options.joinHTMLSpaces,
                removeHTMLBreakLines: options.removeHTMLBreakLines
            });
            break;
    }

    return {
        dependencies: dependencies,
        code: code,
        md5: encryption.md5(code)
    };
};



