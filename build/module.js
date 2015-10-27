/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-26 15:29
 */


'use strict';


var path = require('ydr-utils').path;
var dato = require('ydr-utils').dato;
var debug = require('ydr-utils').debug;
var encryption = require('ydr-utils').encryption;
//var fse = require('fs-extra');

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
    async: false,
    main: null,
    uglifyJSOptions: null,
    srcDirname: null,
    destDirname: null,
    destResourceDirname: null,
    destHost: '/',
    versionLength: 32,
    minifyResource: true
};

/**
 * 构建一个模块
 * @param file {String} 模块路径
 * @param options {Object} 模块属性
 * @param options.inType {String} 模块入口类型
 * @param options.outType {String} 模块出口类型
 * @param options.async {Boolean} 是否为异步模块
 * @param options.main {String} 入口模块
 * @param options.uglifyJSOptions {Object} uglify-js 配置
 * @param options.srcDirname {String} 原始根目录
 * @param options.destDirname {String} 目标根目录
 * @param options.destResourceDirname {String} 目标资源目录
 * @param options.destHost {String} 目标域
 * @param options.versionLength {Number} 版本号长度
 * @param options.minifyResource {Boolean} 压缩静态资源
 * @param options.cleanCSSOptions {Object} clean-css 配置
 * @returns {{dependencies: Array, code: String, md5: String}}
 */
module.exports = function (file, options) {
    options = dato.extend({}, defaults, options);
    // 读取入口模块内容
    var code = reader(file, 'utf8');
    //[{ id: '/Users/cloudcome/development/github/nodejs-coolie/example/src/static/js/libs1/path1/path2/index.js',
    //gid: '1',
    //raw: '../libs1/path1/path2/',
    //name: '../libs1/path1/path2/index.js',
    //inType: 'js',
    //outType: 'js' }]
    var requires = parseCMDRequire(file, {
        code: code,
        async: options.async
    });
    var depName2IdMap = {};
    var depFileMap = {};
    var depGidList = [];
    var dependencies = [];

    dato.each(requires, function (index, item) {
        depName2IdMap[item.raw] = item.gid;

        if (!depFileMap[item.gid]) {
            depFileMap[item.gid] = true;
            depGidList.push(item.gid);
            dependencies.push(item);
        }
    });

    switch (options.inType) {
        case 'js':
            // 1. 压缩代码
            code = minifyJS(file, {
                code: code,
                uglifyJSOptions: options.uglifyJSOptions
            });

            // 1. 替换 require()
            code = replaceAMDRequire(file, {
                code: code,
                async: options.async,
                depName2IdMap: depName2IdMap
            });

            // 同一个文件，不同的模块出口类型，返回的模块是不一样的
            // 例：image|js !== image|url
            var gid = options.main === file ? '0' : globalId.get(file, options.outType);
            // 2. 替换 define()
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
                destCSSDirname: null,
                destResourceDirname: options.destResourceDirname,
                destHost: options.destHost,
                versionLength: options.versionLength,
                minifyResource: options.minifyResource,
                cleanCSSOptions: options.cleanCSSOptions
            });
            break;
    }

    //var fileURI = pathURI.toRootURL(file, options.srcDirname);
    return {
        dependencies: dependencies,
        code: code,
        md5: encryption.md5(code)
    };
};



