/*!
 * 替换 CSS 文件里的资源路径
 * @author ydr.me
 * @create 2015-05-28 11:07
 */


'use strict';

var path = require('path');
var fs = require('fs-extra');
var log = require('./log.js');
var pathURI = require('./path-uri.js');
var base64 = require('./base64.js');
var encryption = require('ydr-utils').encryption;
var REG_SUFFIX = /(\?.*|#.*)$/;
var REG_URL = /url\s*?\((.*?)\)/ig;
var REG_QUOTE = /^["']|['"]$/g;


/**
 * 构建资源版本
 * @param file {String} 待替换的文件
 * @param css {String} 待替换的 CSS 文件
 * @param destCSSFile {String} CSS 文件的保存路径
 * @param [isReplaceToBase64WhenRelativeToFile=false] {Boolean} 是否替换为 base64 编码，当资源相对于当前文件时
 * @returns {String}
 */
module.exports = function (file, css, destCSSFile, isReplaceToBase64WhenRelativeToFile) {
    var configs = global.configs;

    return css.replace(REG_URL, function ($0, $1) {
        $1 = $1.replace(REG_QUOTE, '');

        if (!pathURI.isRelatived($1)) {
            return $0;
        }

        var suffix = ($1.match(REG_SUFFIX) || [''])[0];
        $1 = $1.replace(REG_SUFFIX, '');
        var extname = path.extname($1);
        var absDir = pathURI.isRelativeFile($1) ? path.dirname(file) : configs._srcPath;
        var absFile;

        try {
            absFile = path.join(absDir, $1);
        } catch (err) {
            log('replace resource', pathURI.toSystemPath(file), 'error');
            log('replace resource', $0, 'error');
            log('replace resource', err.message, 'error');
            process.exit(-1);
        }

        if (pathURI.isRelativeFile($1) && isReplaceToBase64WhenRelativeToFile) {
            var b64 = configs._resBase64Map[absFile];

            if (!b64) {
                configs._resBase64Map[absFile] = b64 = base64(absFile);
            }

            return 'url(' + b64 + ')';
        }

        var version = configs._resVerMap[absFile];
        var destFile = configs._resDestMap[absFile];

        if (!version) {
            version = encryption.md5(absFile);

            var destName = version + extname;

            destFile = path.join(configs._destPath, configs.resource.dest, destName);

            try {
                fs.copySync(absFile, destFile);
            } catch (err) {
                log('copy file', pathURI.toSystemPath(file), 'error');
                log('copy from', pathURI.toSystemPath(absFile), 'error');
                log('copy to', pathURI.toSystemPath(destFile), 'error');
                log('copy file', err.message, 'error');
                process.exit(-1);
            }

            configs._resVerMap[absFile] = version;
            configs._resDestMap[absFile] = destFile;
        }

        var url = '';

        // 有目标文件，css 里的资源相对于 css 文件本身
        if (destCSSFile) {
            url = path.relative(path.dirname(destCSSFile), destFile);
        }
        // 否则，css 里的资源相对于根目录
        else {
            url = configs.dest.host + path.relative(configs._destPath, destFile);
        }

        url = pathURI.toURIPath(url) + suffix;

        return 'url(' + url + ')';
    });
};

