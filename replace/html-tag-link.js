/**
 * replace html link
 * @author ydr.me
 * @create 2015-12-17 11:14
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
var minifyCSS = require('../minify/css.js');


var COOLIE_IGNORE = 'coolieignore';
var CSS_TYPES = {
    'text/css': true
};
var REG_LINK = /<link\b[\s\S]*?>/ig;
var minifyCSSmap = {};
var defaults = {
    code: '',
    srcDirname: null,
    destCSSDirname: null,
    destDirname: null,
    destHost: '/',
    versionLength: 32,
    minifyCSS: true,
    cleanCSSOptions: null,
    signCSS: false
};


/**
 * 替换 html script
 * @param file {String} 文件
 * @param options {Object} 配置
 * @param options.code {String} 代码
 * @param options.srcDirname {String} 构建根目录
 * @param options.destDirname {String} 目标根目录
 * @param options.destHost {String} 目标根域
 * @param options.destCSSDirname {String} 目标 CSS 目录
 * @param options.mainVersionMap {Object} 入口文件版本 map，{file: version}
 * @param [options.minifyCSS] {Boolean} 是否压缩 CSS
 * @param [options.cleanCSSOptions] {Object} clean-css 配置
 * @param [options.signCSS] {Boolean} 是否签名 CSS 文件
 * @returns {Object}
 */
module.exports = function (file, options) {
    options = dato.extend(true, {}, defaults, options);
    var code = options.code;

    code = code.replace(REG_LINK, function (source) {
        var ignore = htmlAttr.get(source, COOLIE_IGNORE);
        var originalSource = source;

        if (ignore) {
            source = htmlAttr.remove(source, COOLIE_IGNORE);
            return source;
        }

        var type = htmlAttr.get(source, 'type');
        var href = htmlAttr.get(source, 'href');

        if (type === true || !type) {
            type = 'text/css';
        }

        if (href === true) {
            href = '';
        }

        var isCSSlink = CSS_TYPES[type];

        if (isCSSlink && href) {
            var isRelatived = pathURI.isRelatived(href);

            if (!isRelatived) {
                return source;
            }

            var srcPath = pathURI.toAbsoluteFile(href, file, options.srcDirname);
            var destURI = minifyCSSmap[srcPath];

            if (!destURI) {
                var srcCode = reader(srcPath, 'utf8');
                var destCode = minifyJS(srcPath, {
                    code: srcCode,
                    uglifyJSOptions: options.uglifyJSOptions
                });
                var destVersion = encryption.md5(destCode).slice(0, options.versionLength);
                var destPath = path.join(options.destJSDirname, destVersion + '.js');

                destURI = pathURI.toRootURL(destPath, options.destDirname);
                destURI = pathURI.joinURI(options.destHost, destURI);

                if (options.signJS) {
                    destCode = sign('js') + '\n' + destCode;
                }

                try {
                    fse.outputFileSync(destPath, destCode, 'utf8');
                    minifyJSMap[srcPath] = destURI;
                    debug.success('√', pathURI.toRootURL(srcPath, options.srcDirname));
                } catch (err) {
                    debug.error('write file', path.toSystem(destPath));
                    debug.error('write file', err.message);
                    return process.exit(1);
                }
            }

            source = htmlAttr.set(source, 'href', destURI);
            return source;
        }

        return source;
    });
};


