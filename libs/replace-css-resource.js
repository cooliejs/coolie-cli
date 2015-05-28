/*!
 * 替换 CSS 文件里的资源路径
 * @author ydr.me
 * @create 2015-05-28 11:07
 */


'use strict';

var path = require('path');
var fs = require('fs-extra');
var htmlAttr = require('./html-attr.js');
var log = require('./log.js');
var pathURI = require('./path-uri.js');
var base64 = require('./base64.js');
var REG_HTTP = /^(https?:)?\/\//i;
var REG_ABSOLUTE = /^\//;
var REG_SUFFIX = /(\?.*|#.*)$/;
var REG_URL = /url\s*?\((.*?)\)/ig;
var REG_QUOTE = /^["']|['"]$/g;


/**
 * 构建资源版本
 * @param file {String} 待替换的文件
 * @param css {String} 待替换的 CSS 文件
 * @param [isReplaceToBase64WhenRelativeToFile=false] {Boolean} 是否替换为 base64 编码，当资源相对于当前文件时
 * @returns {String}
 */
module.exports = function (file, css, isReplaceToBase64WhenRelativeToFile) {
    var configs = global.configs;

    return css.replace(REG_URL, function ($0, $1) {
        $1 = $1.replace(REG_QUOTE, '');

        if (REG_HTTP.test($1)) {
            return $0;
        }

        var suffix = ($1.match(REG_SUFFIX) || [''])[0];
        $1 = $1.replace(REG_SUFFIX, '');
        var srcName = path.basename($1);
        var isRelativeToFile = !REG_ABSOLUTE.test($1);
        var absDir = isRelativeToFile ? path.dirname(file) : configs._srcPath;
        var absFile;

        try {
            absFile = path.join(absDir, $1);
        } catch (err) {
            log('replace resource', pathURI.toSystemPath(file), 'error');
            log('replace resource', $0, 'error');
            log('replace resource', err.message, 'error');
            process.exit();
        }

        if (isRelativeToFile && isReplaceToBase64WhenRelativeToFile) {
            var b64 = configs._resBase64Map[absFile];

            if (!b64) {
                configs._resBase64Map[absFile] = b64 = base64(absFile);
            }

            return 'url(' + b64 + ')';
        }

        var url = '';
        var resFile = path.join(configs._destPath, configs.resource.dest, resName);

        try {
            fs.copySync(absFile, resFile);
        } catch (err) {
            log('css file', pathURI.toSystemPath(file), 'error');
            log('copy from', pathURI.toSystemPath(absFile), 'error');
            log('copy to', pathURI.toSystemPath(resFile), 'error');
            log('copy file', err.message, 'error');
            process.exit();
        }

    });
};

