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
var REG_URL = /url\s*?\((.*?)\)/ig;
var REG_QUOTE = /^["']|['"]$/g;


/**
 * 构建资源版本
 * @param file {String} 待替换的文件
 * @param css {String} 待替换的 CSS 文件
 * @param destCSSFile {String} CSS 文件的保存路径
 * @returns {String}
 */
module.exports = function (file, css, destCSSFile) {
    var configs = global.configs;

    return css.replace(REG_URL, function ($0, $1) {
        $1 = $1.replace(REG_QUOTE, '');

        var pathRet = pathURI.parseURI2Path($1);

        if (!pathURI.isRelatived(pathRet.path) || pathURI.isBase64(pathRet.original)) {
            return $0;
        }

        var absDir = pathURI.isRelativeFile(pathRet.path) ? path.dirname(file) : configs._srcPath;
        var absFile;

        try {
            absFile = path.join(absDir, pathRet.path);
        } catch (err) {
            log('replace resource', pathURI.toSystemPath(file), 'error');
            log('replace resource', $0, 'error');
            log('replace resource', err.message, 'error');
            process.exit(1);
        }

        if (!destCSSFile) {
            var b64 = configs._resBase64Map[absFile];

            if (!b64) {
                configs._resBase64Map[absFile] = b64 = base64(absFile);
            }

            return 'url(' + b64 + ')';
        }

        var version = configs._resVerMap[absFile];
        var destFile = configs._resDestMap[absFile];

        if (!version) {
            version = encryption.etag(absFile).slice(0, configs.dest.versionLength);

            //var isImage = pathURI.isImage(extname);

            destFile = path.join(configs._destPath, configs.resource.dest, version + pathRet.extname);

            //if (configs.resource.minify !== false && isImage) {
            //    if (!configs._resImageMap[absFile]) {
            //        configs._resImageMap[absFile] = destFile;
            //        configs._resImageList.push(absFile);
            //    }
            //} else if (configs.resource.minify === false || !isImage) {
            try {
                fs.copySync(absFile, destFile);
            } catch (err) {
                log('copy file', pathURI.toSystemPath(file), 'error');
                log('copy from', pathURI.toSystemPath(absFile), 'error');
                log('copy to', pathURI.toSystemPath(destFile), 'error');
                log('copy file', err.message, 'error');
                process.exit(1);
            }
            //}

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
            url = pathURI.joinURI(configs.dest.host, path.relative(configs._destPath, destFile));
        }

        url = pathURI.toURIPath(url) + pathRet.suffix;

        return 'url(' + url + ')';
    });
};