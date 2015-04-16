/*!
 * html 文件的内容替换
 * @author ydr.me
 * @create 2014-11-14 13:39
 */

'use strict';

var fs = require('fs-extra');
var path = require('path');
var encryption = require('ydr-utils').encryption;
var dato = require('ydr-utils').dato;
var log = require('./log.js');
var htmlminify = require('./htmlminify.js');
var REG_BEGIN = /<!--\s*?coolie\s*?-->/ig;
var REG_END = /<!--\s*?\/coolie\s*?-->/i;
var REG_LINK = /<link\b[^>]*?\bhref\b\s*?=\s*?['"](.*?)['"][^>]*?>/gi;
var REG_IMG = /<img\b([^>]*?)\bsrc\b\s*?=\s*?['"](.*?)['"]([^>]*?)>/gi;
var REG_SCRIPT = /<script\b([^>]*?)\bsrc\b\s*?=\s*?['"]([^>]*?)['"]([^>]*?)>[^>]*?<\/script>/gi;
var REG_COOLIE = /<!--\s*?coolie\s*?-->([\s\S]*?)<!--\s*?\/coolie\s*?-->/gi;
var REG_ABSOLUTE = /^\//;
var REG_HTTP = /^(https?:)?\/\//;
var REG_MAIN = /\bdata-main\b\s*?=\s*?['"](.*?)['"]/;
// 相同的组合只产生出一个文件
var concatMap = {};
var buildMap = {};
var REG_SUFFIX = /(\?.*|#.*)$/;
var REG_IGNORE = /\bcoolieignore\b/i;


/**
 * 提取 CSS 依赖并合并依赖
 * @param file {String} HTML 文件路径
 * @param data {String} HTML 文件内容
 * @param srcPath {String} 源路径
 * @param destPath {String} 目的路径
 * @param cssPath {String} 生成CSS文件路径
 * @param jsBase {String} coolie 配置的 base 目录
 * @returns {{concat: Array, data: *}}
 */
module.exports = function (file, data, srcPath, destPath, cssPath, jsBase) {
    var matches = data.split(REG_BEGIN);
    var concat = [];
    var replaceIndex = 0;
    var dirname = path.dirname(file);
    var mainJS = '';
    var cssHost = config.css.host;

    // 只对 <script> 进行解析而不替换。
    data.replace(REG_SCRIPT, function ($0, $1, $2, $3) {
        //var file;
        var main = _getMain($1, $3);
        //var fixSrc;

        if (main) {
            main = path.join(jsBase, main);
            main = path.relative(srcPath, main);
            mainJS = dato.toURLPath(main);
        }
    });

    // 循环匹配 <!--coolie-->(matched)<!--/coolie-->
    matches.forEach(function (matched) {
        var array = matched.split(REG_END);
        var link = array[0];
        var hrefMatches;
        var files = [];
        var md5List = '';
        var fileName;
        var filePath;
        var fileURL;
        var findMath = null;
        var file;
        var href;

        if (array.length === 2) {
            // <link href=".*">
            while ((hrefMatches = REG_LINK.exec(link))) {
                href = hrefMatches[1];

                if (REG_ABSOLUTE.test(href)) {
                    file = path.join(srcPath, href);
                } else {
                    file = path.join(dirname, href);
                }

                files.push(file);
                md5List += encryption.etag(file);
            }
        }

        dato.each(concatMap, function (name, matched) {
            if (matched.files.length !== files.length) {
                return false;
            }

            var compare = dato.compare(matched.files, files);

            // 完全匹配
            if (compare && compare.different.length === 0) {
                findMath = dato.extend(true, {}, matched);
                return false;
            }
        });

        if (findMath) {
            filePath = path.join(cssPath, findMath.name);
            filePath = path.relative(srcPath, filePath);
            fileURL = cssHost + dato.toURLPath(filePath);
            findMath.url = fileURL;
            findMath.isRepeat = true;
            concat.push(findMath);
        } else {
            if (files.length) {
                fileName = encryption.md5(md5List).slice(0, 16) + '.css';
                filePath = path.join(cssPath, fileName);
                filePath = path.relative(srcPath, filePath);
                fileURL = cssHost + dato.toURLPath(filePath);

                concat.push({
                    name: fileName,
                    url: fileURL,
                    file: filePath,
                    files: files
                });
                concatMap[fileName] = concat[concat.length - 1];
            }
        }
    });

    data = data.replace(REG_COOLIE, function ($0, $1) {
        return $1 ? '<link rel="stylesheet" href="' + concat[replaceIndex++].url + '"/>' : $0;
    });

    data = data.replace(REG_IMG, function ($0, $1, $2, $3) {
        if (REG_IGNORE.test($0)) {
            return $0.replace(REG_IGNORE, '');
        }

        if (REG_HTTP.test($2)) {
            return $0;
        }

        var absFile = path.join(srcPath, $2);
        var basename = path.basename(absFile);
        var srcName = basename.replace(REG_SUFFIX, '');
        var suffix = (basename.match(REG_SUFFIX) || [''])[0];

        absFile = absFile.replace(REG_SUFFIX, '');

        var url = buildMap[absFile];
        var version = config._resVerMap[absFile];

        if (!version) {
            version = encryption.etag(absFile);
        }

        if (!version) {
            log('read file', dato.fixPath(absFile), 'error');
            process.exit();
        }

        // 未进行版本构建
        if (!url) {
            var extname = path.extname(srcName);
            var resName = version + extname;
            var resFile = path.join(destPath, config.resource.dest, resName);

            try {
                fs.copySync(absFile, resFile);
            } catch (err) {
                log('html file', dato.fixPath(file), 'error');
                log('copy from', dato.fixPath(absFile), 'error');
                log('copy to', dato.fixPath(resFile), 'error');
                log('copy file', err.message, 'error');
                process.exit();
            }

            buildMap[absFile] = url = '/' + path.relative(destPath, resFile);
        }

        return '<img' + $1 + 'src="' + url + suffix + '"' + $3 + '>';
    });

    return {
        concat: concat,
        data: config.html.minify ? htmlminify(file, data) : data,
        mainJS: mainJS
    };
};


/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////

/**
 * 提取 data-main 值
 * @param $1 {String} 前
 * @param $3 {String} 后
 * @returns {String|null}
 * @private
 */
function _getMain($1, $3) {
    var matches = $1.match(REG_MAIN);

    if (matches) {
        return matches[1];
    }

    matches = $3.match(REG_MAIN);

    if (matches) {
        return matches[1];
    }

    return null;
}

