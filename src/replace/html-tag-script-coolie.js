/**
 * html <script> replace
 * @author ydr.me
 * @create 2015-10-22 18:41
 */


'use strict';

var object = require('blear.utils.object');
var path = require('blear.node.path');
var debug = require('blear.node.debug');
var console = require('blear.node.console');

var pathURI = require('../utils/path-uri.js');
var copy = require('../utils/copy.js');
var progress = require('../utils/progress.js');
var parseHTML = require('../parse/html.js');

var JS_TYPES = {
    'javascript': true,
    'text/javascript': true,
    'text/ecmascript': true,
    'text/ecmascript-6': true,
    'text/jsx': true,
    'application/javascript': true,
    'application/ecmascript': true
};
var DEFAULT_JS_TYPE = 'text/javascript';
var COOLIE_IGNORE = 'coolieignore';
var COOLIE = 'coolie';
var DATA_MAIN = 'data-main';
var DATA_CONFIG = 'data-config';
var REG_SCRIPT = /(<script\b[\s\S]*?>)([\s\S]*?)<\/script>/ig;
// 有歧义的代码片段
var REG_AMBIGUITY_SLICE = /}};?<\/script>$/;
var REG_LINE = /[\n\r]/g;
var REG_SPACE = /\s+/g;
var defaults = {
    code: '',
    srcDirname: null,
    srcCoolieConfigMainModulesDirname: null,
    destJSDirname: null,
    destDirname: null,
    destHost: '/',
    destCoolieConfigJSPath: null,
    mainVersionMap: {},
    versionLength: 32,
    minifyJS: true,
    uglifyJSOptions: null,
    signJS: false,
    mute: false
};
var minifyPathMap = {};
var minifyJSMap = {};


/**
 * 替换 html script
 * @param file {String} 文件
 * @param options {Object} 配置
 * @param options.code {String} 代码
 * @param options.srcDirname {String} 构建根目录
 * @param options.srcCoolieConfigMainModulesDirname {String} coolie-config:base 目录
 * @param options.destDirname {String} 目标根目录
 * @param options.destHost {String} 目标根域
 * @param options.destJSDirname {String} 目标 JS 目录
 * @param options.destCoolieConfigJSPath {String} 目标 coolie-config.js 路径
 * @param options.mainVersionMap {Object} 入口文件版本 map，{file: version}
 * @param options.versionLength {Number} 版本号长度
 * @param [options.minifyJS] {Boolean} 是否压缩 JS
 * @param [options.uglifyJSOptions] {Object} uglify-js 配置
 * @param [options.signJS] {Boolean} 是否签名 JS 文件
 * @param [options.mute] {Boolean} 是否静音
 * @param [options.progressKey] {String} 进度日志键
 * @returns {Object}
 */
module.exports = function (file, options) {
    options = object.assign(true, {}, defaults, options);
    var code = options.code;
    var mainList = [];
    var jsList = [];

    code = parseHTML(code).match({
        tag: 'script'
    }, function (node) {
        if (!node.attrs.hasOwnProperty('src')) {
            return node;
        }

        var type = node.attrs.type || DEFAULT_JS_TYPE;
        var isJS = JS_TYPES[type];

        if (!isJS) {
            return node;
        }

        if (!node.attrs.hasOwnProperty(COOLIE)) {
            return node;
        }

        if (node.attrs.hasOwnProperty(COOLIE_IGNORE)) {
            node.attrs[COOLIE_IGNORE] = null;
            return node;
        }

        var src = node.attrs.src;
        // src 是否静态路径
        var isStaticSrc = pathURI.isURL(src);

        // 有 coolie 属性
        var dataMain = node.attrs[DATA_MAIN];
        var dataConfig = node.attrs[DATA_CONFIG];

        if (!dataMain) {
            debug.error('coolie script', file);
            debug.error('coolie script', '`' + DATA_MAIN + '` is empty');
            return process.exit(1);
        }

        if (!dataConfig) {
            debug.error('coolie script', file);
            debug.error('coolie script', '`' + DATA_CONFIG + '` is empty');
            return process.exit(1);
        }

        if (!options.srcCoolieConfigMainModulesDirname) {
            debug.error('coolie script', file);
            debug.error('coolie script', '`coolie-config.js` is NOT defined, but used');
            return process.exit(1);
        }

        var mainPath = path.join(options.srcCoolieConfigMainModulesDirname, dataMain);
        var mainVersion = options.mainVersionMap[mainPath];

        mainList.push(mainPath);

        if (!path.isFile(mainPath)) {
            debug.error('coolie main', '`' + mainPath + '` is NOT a file');
            return process.exit(1);
        }

        if (!mainVersion) {
            debug.error('coolie script', 'can not found `data-main` version');
            debug.error('coolie `data-main`', dataMain);
            debug.error('main file', mainPath);
            debug.error('html file', file);
            return process.exit(1);
        }

        var coolieConfigURI = pathURI.toRootURL(options.destCoolieConfigJSPath, options.destDirname);

        coolieConfigURI = pathURI.joinHost('js', options.destHost, coolieConfigURI);

        // 本域并且 src 为静态
        if (!pathURI.isURL(coolieConfigURI) && isStaticSrc) {
            coolieConfigURI = '~' + coolieConfigURI;
        }

        if (options.progressKey) {
            progress.run(options.progressKey, dataConfig);
        }

        node.attrs[DATA_MAIN] = mainVersion + '.js';
        node.attrs[DATA_CONFIG] = coolieConfigURI;
        node.attrs[COOLIE] = null;

        return node;
    }).exec();

    return {
        code: code,
        mainList: mainList,
        jsList: jsList
    };
};
