/*!
 * cssminify.js
 * @author ydr.me
 * @create 2014-10-23 19:47
 */


"use strict";

var fs = require('fs-extra');
var CleanCSS = require("clean-css");
var log = require('./log.js');
var pathURI = require('./path-uri.js');
var dato = require('ydr-utils').dato;
var typeis = require('ydr-utils').typeis;
var encryption = require('ydr-utils').encryption;
var path = require('path');
var defaults = {
    // 高级优化
    advanced: false,
    // 属性合并
    aggressiveMerging: false,
    // 兼容性，“ie7”、“ie8”、“*”（ie9+）
    compatibility: 'ie7',
    // 调试信息
    debug: false,
    // 断行
    keepBreaks: false,
    // 注释
    keepSpecialComments: 0,
    // 媒体查询合并
    mediaMerging: true,
    // url 检查
    rebase: false,
    // 资源地图
    sourceMap: false
};
var cssminify = null;
var REG_URL = /url\s*?\((.*?)\)/ig;
var REG_REMOTE = /^(https?:)?\/\//i;
var REG_SUFFIX = /(\?.*|#.*)$/;
var REG_ABSPATH = /^\//;
var REG_QUOTE = /^["']|['"]$/g;
var buildMap = {};


/**
 * 样式压缩
 * @param file
 * @param code
 * @param [destFile]
 * @param [callback]
 */
module.exports = function (file, code, destFile, callback) {
    var args = arguments;
    var hasResVersionMap = true;
    var configs = global.configs;
    var srcPath = configs._srcPath;
    var destPath = configs._destPath;

    if (!cssminify) {
        var cleancss = new CleanCSS(dato.extend({}, defaults, configs.css.minify));

        cssminify = function (file, code) {
            return cleancss.minify.call(cleancss, code).styles;
        };
    }

    // cssminify(file, code)
    // cssminify(file, code, callabck)
    if (typeis.function(args[2]) || typeis.undefined(args[2])) {
        callback = args[2];
        hasResVersionMap = false;
    }


    try {
        code = cssminify(file, code);
        code = hasResVersionMap ? _cssUrlVersion() : code;

        if (callback) {
            callback(null, code);
        } else {
            return code;
        }
    } catch (err) {
        log('cssminify', pathURI.toSystemPath(file), 'error');
        log('cssminify', err.message, 'error');
        process.exit();
    }


    /**
     * CSS 引用资源路径替换
     * @returns {string}
     * @private
     */
    function _cssUrlVersion() {
        var fileDir = path.dirname(file);

        return code.replace(REG_URL, function ($0, $1) {
            $1 = $1.replace(REG_QUOTE, '');
            // 以下情况忽略添加版本号：
            // //path/to/abc.png
            // http://path/to/abc.png
            // https://path/to/abc.png
            if (REG_REMOTE.test($1)) {
                return 'url(' + $1 + ')';
            }

            var absFile = path.join(REG_ABSPATH.test($1) ? srcPath : fileDir, $1);
            var basename = path.basename(absFile);
            var srcName = basename.replace(REG_SUFFIX, '');
            var suffix = (basename.match(REG_SUFFIX) || [''])[0];

            absFile = absFile.replace(REG_SUFFIX, '');

            var url = buildMap[absFile];
            var version = configs._resVerMap[absFile];

            if (!version) {
                version = encryption.md5(absFile);
            }

            if (!version) {
                log('read file', pathURI.toSystemPath(absFile), 'error');
                process.exit();
            }

            configs._resVerMap[absFile] = version;

            // 未进行版本构建
            if (!url) {
                var extname = path.extname(srcName);
                var resName = version + extname;
                var resFile = path.join(destPath, configs.resource.dest, resName);

                try {
                    fs.copySync(absFile, resFile);
                } catch (err) {
                    log('css file', pathURI.toSystemPath(file), 'error');
                    log('copy from', pathURI.toSystemPath(absFile), 'error');
                    log('copy to', pathURI.toSystemPath(resFile), 'error');
                    log('copy file', err.message, 'error');
                    process.exit();
                }

                buildMap[absFile] = url = path.relative(path.dirname(destFile), resFile);
            }

            return 'url(' + url + suffix + ')';
        });
    }
};


