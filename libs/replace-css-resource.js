/*!
 * 替换 CSS 文件里的资源路径
 * @author ydr.me
 * @create 2015-05-28 11:07
 */


'use strict';

var path = require('ydr-utils').path;
var fs = require('fs-extra');
var log = require('./log.js');
var pathURI = require('./path-uri.js');
var base64 = require('./base64.js');
var copy = require('./copy.js');
// background: url("...");
var REG_URL = /url\s*?\((.*?)\)/ig;
// _filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(src="...");
var REG_SRC = /\(src\s*?=\s*?(.*?)\)/;
var REG_QUOTE = /^["']|['"]$/g;
var regs = [{
    before: 'url(',
    reg: REG_URL,
    after: ')'
}, {
    before: '(src="',
    reg: REG_SRC,
    after: '")'
}];


/**
 * 构建资源版本
 * @param file {String} 待替换的文件
 * @param css {String} 待替换的 CSS 文件
 * @param destCSSFile {String} CSS 文件的保存路径
 * @returns {String}
 */
module.exports = function (file, css, destCSSFile) {
    var configs = global.configs;

    regs.forEach(function (item) {
        css = css.replace(item.reg, function (all, resource) {
            resource = resource.replace(REG_QUOTE, '');

            var pathRet = pathURI.parseURI2Path(resource);

            if (!pathURI.isRelatived(pathRet.path) || pathURI.isBase64(pathRet.original)) {
                return all;
            }

            var absDir = pathURI.isRelativeFile(pathRet.path) ? path.dirname(file) : configs._srcPath;
            var absFile = path.join(absDir, pathRet.path);
            var destFile = copy(absFile, {
                dest: configs._resDestPath,
                version: true,
                logType: 1,
                srcFile: file,
                srcCode: all
            });

            var url = '';

            // 有目标文件，css 里的资源相对于 css 文件本身
            if (destCSSFile) {
                url = pathURI.relative(path.dirname(destCSSFile), destFile);
            }
            // 否则，css 里的资源相对于根目录
            else {
                url = pathURI.joinURI(configs.dest.host, pathURI.relative(configs._destPath, destFile));
            }

            url = pathURI.toURIPath(url) + pathRet.suffix;

            return item.before + url + item.after;
        });
    });

    return css;
};