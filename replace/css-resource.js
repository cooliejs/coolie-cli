/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-22 16:02
 */


'use strict';



var path = require('ydr-utils').path;
var debug = require('ydr-utils').debug;

var pathURI = require('../utils/path-uri.js');
var base64 = require('../utils/base64.js');
var copy = require('../utils/copy.js');

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
 * 构建 css 资源版本
 * @param file {String} 待替换的文件
 * @param options {Object} 配置
 * @param options.code {String} 代码
 * @param options.versionLength {Number} 版本长度
 * @param options.srcDirname {String} 构建工程原始根目录
 * @param options.destDirname {String} 目标根目录
 * @param options.destHost {String} 目标文件 URL 域
 * @param options.destResourceDirname {String} 目标资源文件保存目录
 * @param [options.destCSSFile] {String} 目标样式文件，如果存在，则相对
 * @param [options.minifyResource] {Boolean} 压缩资源文件
 * @returns {String}
 */
module.exports = function (file, options) {
    //var copyFiles = [];
    var code = options.code;

    regs.forEach(function (item) {
        code = code.replace(item.reg, function (all, resource) {
            resource = resource.replace(REG_QUOTE, '');

            var pathRet = pathURI.parseURI2Path(resource);

            if (!pathURI.isRelatived(pathRet.path) || pathURI.isBase64(pathRet.original)) {
                return all;
            }

            var absDir = pathURI.isRelativeFile(pathRet.path) ? path.dirname(file) : options.srcDirname;
            var absFile = path.join(absDir, pathRet.path);
            //copyFiles.push(path.relative(options.srcDirname, absFile));
            var destFile = copy(absFile, {
                destDirname: options.destResourceDirname,
                copyPath: false,
                version: true,
                versionLength: options.versionLength,
                logType: 1,
                embedFile: file,
                embedCode: all
            });

            var url = '';

            // 有目标文件，css 里的资源相对于 css 文件本身
            if (options.destCSSFile) {
                url = pathURI.relative(path.dirname(options.destCSSFile), destFile);
            }
            // 否则，css 里的资源相对于根目录
            else {
                url = pathURI.joinURI(options.destHost, pathURI.relative(options.destDirname, destFile));
            }

            url = pathURI.toURIPath(url) + pathRet.suffix;

            return item.before + url + item.after;
        });
    });

    return code;
};





