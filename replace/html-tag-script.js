/**
 * html <script> replace
 * @author ydr.me
 * @create 2015-10-22 18:41
 */


'use strict';

var fse = require('fs-extra');
var dato = require('ydr-utils').dato;
var path = require('ydr-utils').path;
var debug = require('ydr-utils').debug;
var typeis = require('ydr-utils').typeis;
var encryption = require('ydr-utils').encryption;

var htmlAttr = require('../utils/html-attr.js');
var pathURI = require('../utils/path-uri.js');
var copy = require('../utils/copy.js');
var sign = require('../utils/sign.js');
var reader = require('../utils/reader.js');
var minifyJS = require('../minify/js.js');

var JS_TYPES = [
    'javascript',
    'text/javascript',
    'text/ecmascript',
    'text/ecmascript-6',
    'text/jsx',
    'application/javascript',
    'application/ecmascript'
];
var COOLIE_IGNORE = 'coolieignore';
var COOLIE = 'coolie';
var REG_SCRIPT = /(<script\b[\s\S]*?>)([\s\S]*?)<\/script>/ig;
// 有歧义的代码片段
var REG_AMBIGUITY_SLICE = /}};?<\/script>$/;
var REG_LINE = /[\n\r]/g;
var REG_SPACE = /\s+/g;
var defaults = {
    code: '',
    srcDirname: null,
    srcCoolieConfigBaseDirname: null,
    destJSDirname: null,
    destDirname: null,
    destHost: '/',
    destCoolieConfigJSPath: null,
    mainVersionMap: {},
    versionLength: 32,
    minifyJS: true,
    uglifyJSOptions: null,
    signJS: false
};
var minifyJSMap = {};


/**
 * 替换 html script
 * @param file {String} 文件
 * @param options {Object} 配置
 * @param options.code {String} 代码
 * @param options.srcDirname {String} 构建根目录
 * @param options.srcCoolieConfigBaseDirname {String} coolie-config:base 目录
 * @param options.destDirname {String} 目标根目录
 * @param options.destHost {String} 目标根域
 * @param options.destJSDirname {String} 目标 JS 目录
 * @param options.destCoolieConfigJSPath {String} 目标 coolie-config.js 路径
 * @param options.mainVersionMap {Object} 入口文件版本 map，{file: version}
 * @param options.versionLength {Number} 版本号长度
 * @param [options.minifyJS] {Boolean} 是否压缩 JS
 * @param [options.uglifyJSOptions] {Object} uglify-js 配置
 * @param [options.signJS] {Boolean} 是否签名 JS 文件
 * @returns {Object}
 */
module.exports = function (file, options) {
    options = dato.extend(true, {}, defaults, options);
    var code = options.code;
    var mainList = [];

    code = code.replace(REG_SCRIPT, function (source, scriptTag, scriptCode) {
        var ignore = htmlAttr.get(source, COOLIE_IGNORE);
        var originalSource = source;

        if (ignore) {
            source = htmlAttr.remove(source, COOLIE_IGNORE);
            return source;
        }

        var type = htmlAttr.get(scriptTag, 'type');
        var hasCoolie = htmlAttr.get(scriptTag, COOLIE);
        var src = htmlAttr.get(scriptTag, 'src');

        // 有 coolie 属性
        if (src && hasCoolie) {
            var dataMain = htmlAttr.get(source, 'data-main');
            var dataConfig = htmlAttr.get(source, 'data-config');

            if (!dataMain || dataMain === true) {
                debug.error('coolie script', path.toSystem(file));
                debug.error('coolie script', originalSource);
                debug.error('coolie script', '`data-main` is empty');
                return process.exit(1);
            }

            if (!dataConfig || dataConfig === true) {
                debug.error('coolie script', path.toSystem(file));
                debug.error('coolie script', originalSource);
                debug.error('coolie script', '`data-config` is empty');
                return process.exit(1);
            }

            var mainPath = path.join(options.srcCoolieConfigBaseDirname, dataMain);
            var mainVersion = options.mainVersionMap[mainPath];

            mainList.push(mainPath);

            if (!typeis.file(mainPath)) {
                debug.error('coolie main', '`' + path.toSystem(mainPath) + '` is NOT a file');
                return process.exit(1);
            }

            if (!mainVersion) {
                debug.error('coolie script', 'can not found `data-main` version');
                debug.error('coolie `data-main`', dataMain);
                debug.error('main file', path.toSystem(mainPath));
                debug.error('html file', path.toSystem(file));
                debug.error('html code', originalSource);
                return process.exit(1);
            }

            var coolieConfigURI = pathURI.toRootURL(options.destCoolieConfigJSPath, options.destDirname);

            // 绝对路径，相对他域
            if (pathURI.isURL(options.destHost)) {
                coolieConfigURI = pathURI.joinURI(options.destHost, coolieConfigURI);
            }
            // 相对本域
            else {
                coolieConfigURI = '~' + pathURI.joinURI(options.destHost, coolieConfigURI);
            }

            source = htmlAttr.set(source, 'data-main', mainVersion + '.js');
            source = htmlAttr.set(source, 'data-config', coolieConfigURI);
            source = htmlAttr.remove(source, COOLIE);
            source = source.replace(REG_LINE, '').replace(REG_SPACE, ' ');
        }

        // 有 src 属性
        if (src) {
            var isRelatived = pathURI.isRelatived(src);

            if (!isRelatived) {
                return source;
            }

            var srcPath = pathURI.toAbsoluteFile(src, file, options.srcDirname);
            var destURI = minifyJSMap[srcPath];

            if (!destURI) {
                var srcCode = reader(srcPath, 'utf8');
                var destCode = minifyJS(srcPath, {
                    code: srcCode,
                    uglifyJSOptions: options.uglifyJSOptions
                });
                var destVersion = encryption.md5(destCode);
                var destPath = path.join(options.destJSDirname, destVersion + '.js');

                destURI = pathURI.toRootURL(destPath, options.destDirname);
                destURI = pathURI.joinURI(options.destHost, destURI);

                if (options.signJS) {
                    destCode = sign('js') + '\n' + destCode;
                }

                try {
                    fse.writeFileSync(destPath, destCode, 'utf8');
                    minifyJSMap[srcPath] = destURI;
                    debug.success('√', pathURI.toRootURL(srcPath, options.srcDirname));
                } catch (err) {
                    debug.error('write file', path.toSystem(destPath));
                    debug.error('write file', err.message);
                    return process.exit(1);
                }
            }

            source = htmlAttr.set(source, 'src', destURI);
            return source;
        }

        var find = !type;

        if (!find) {
            dato.each(JS_TYPES, function (index, _type) {
                if (type === _type) {
                    find = true;
                    return false;
                }
            });
        }

        if (find && options.minifyJS) {
            scriptCode = minifyJS(file, {
                code: scriptCode,
                uglifyJSOptions: options.uglifyJSOptions
            });
        }

        var ret = scriptTag + scriptCode + '</script>';

        return ret.replace(REG_AMBIGUITY_SLICE, '}/**/}</script>');
    });

    return {
        code: code,
        mainList: mainList
    };
};
