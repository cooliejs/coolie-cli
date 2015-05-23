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
var htmlAttr = require('./html-attr.js');
var pathURI = require('./path-uri.js');
var htmlminify = require('./htmlminify.js');
var replaceVersion = require('./replace-version.js');
var REG_BEGIN = /<!--\s*?coolie\s*?-->/ig;
var REG_END = /<!--\s*?\/coolie\s*?-->/i;
var REG_LINK = /<link\b[^>]*?\bhref\b\s*?=\s*?['"](.*?)['"][^>]*?>/gi;
var REG_IMG = /<img\b[\s\S]*?>/gi;
var REG_SCRIPT = /<script[^>]*?>[\s\S]*?<\/script>/gi;
var REG_COOLIE = /<!--\s*?coolie\s*?-->([\s\S]*?)<!--\s*?\/coolie\s*?-->/gi;
var REG_ABSOLUTE = /^\//;
var REG_HTTP = /^(https?:)?\/\//i;
// 相同的组合只产生出一个文件
var concatMap = {};
var buildMap = {};
var REG_SUFFIX = /(\?.*|#.*)$/;


/**
 * 提取 CSS 依赖并合并依赖
 * @param file {String} HTML 文件路径
 * @param code {String} HTML 文件内容
 * @returns {{concat: Array, code: *, mainJS: String}}
 */
module.exports = function (file, code) {
    var configs = global.configs;
    var srcPath = configs._srcPath;
    var destPath = configs._destPath;
    var cssPath = configs._cssPath;
    var jsBase = configs._jsBase;
    var matches = code.split(REG_BEGIN);
    var concat = [];
    var replaceIndex = 0;
    var dirname = path.dirname(file);
    var mainJS = '';

    // 对 <script> 进行解析并且替换。
    code = code.replace(REG_SCRIPT, function ($0, $1, $2, $3) {
        //var file;
        var dataMain = htmlAttr.get($0, 'data-main');
        var dataConfig = htmlAttr.get($0, 'data-config');
        var hasCoolie = htmlAttr.get($0, 'coolie');

        if (hasCoolie && !dataConfig) {
            log('warning', pathURI.toSystemPath(file), 'error');
            log('warning', 'coolie.js script `data-config` attribute is EMPTY.', 'error');
        }

        if (hasCoolie && !dataMain) {
            log('warning', pathURI.toSystemPath(file), 'error');
            log('warning', 'coolie.js script `data-main` attribute is EMPTY.', 'error');
        }

        if (dataMain && dataConfig && hasCoolie) {
            try {
                dataMain = path.join(jsBase, dataMain);
            } catch (err) {
                log('html file', pathURI.toSystemPath(file), 'error');
                log('data-main', dataMain ? dataMain : '<EMPTY>', 'error');
                process.exit();
            }

            dataMain = path.relative(srcPath, dataMain);
            mainJS = pathURI.toURIPath(dataMain);
            $0 = htmlAttr.remove($0, 'coolie');

            if (configs.dest.host) {
                $0 = htmlAttr.set($0, 'data-config', configs.dest.host + replaceVersion(configs._coolieConfigJSURI, configs._coolieConfigVersion));
            } else {
                $0 = htmlAttr.set($0, 'data-config', replaceVersion(dataConfig, configs._coolieConfigVersion));
            }
        }

        return $0;
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
            fileURL = configs.dest.host + pathURI.toURIPath(filePath);
            findMath.url = fileURL;
            findMath.isRepeat = true;
            concat.push(findMath);
        } else {
            if (files.length) {
                fileName = encryption.md5(md5List) + '.css';
                filePath = path.join(cssPath, fileName);
                filePath = path.relative(srcPath, filePath);
                fileURL = configs.dest.host + pathURI.toURIPath(filePath);

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

    code = code.replace(REG_COOLIE, function ($0, $1) {
        return $1 ? '<link rel="stylesheet" href="' + concat[replaceIndex++].url + '"/>' : $0;
    });

    // <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">
    // <link rel="apple-touch-icon" href="/apple-touch-icon-72.png" />
    code = code.replace(REG_LINK, function ($0) {
        var rel = htmlAttr.get($0, 'rel');
        var type = htmlAttr.get($0, 'type');
        var href = htmlAttr.get($0, 'href');

        if (rel === 'shortcut icon' || rel === 'apple-touch-icon' || type === 'image/x-icon') {
            return _buildResVersion(file, $0, 'href');
        }

        return $0;
    });

    // <img src=".*">
    code = code.replace(REG_IMG, function ($0) {
        if (htmlAttr.get($0, 'coolieignore')) {
            return htmlAttr.remove($0, 'coolieignore');
        }

        return _buildResVersion(file, $0, 'src');
    });

    return {
        concat: concat,
        code: htmlminify(file, code),
        mainJS: mainJS
    };
};


/**
 * 构建资源版本
 * @param file
 * @param html
 * @param attrKey
 * @returns {String}
 * @private
 */
function _buildResVersion(file, html, attrKey) {
    var value = htmlAttr.get(html, attrKey);

    if (REG_HTTP.test(value) || !value) {
        return html;
    }

    var absFile;

    try {
        absFile = path.join(configs._srcPath, value);
    } catch (err) {
        log('html file', pathURI.toSystemPath(file), 'error');
        log('img', html, 'error');
        log('img src', value === true ? '<EMPTY>' : value, 'error');
        process.exit();
    }

    var basename = path.basename(absFile);
    var srcName = basename.replace(REG_SUFFIX, '');
    var suffix = (basename.match(REG_SUFFIX) || [''])[0];

    absFile = absFile.replace(REG_SUFFIX, '');

    var url = buildMap[absFile];
    var version = configs._resVerMap[absFile];

    if (!version) {
        version = encryption.etag(absFile);
    }

    // 未进行版本构建
    if (!url) {
        var extname = path.extname(srcName);
        var resName = version + extname;
        var resFile = path.join(configs._destPath, configs.resource.dest, resName);

        try {
            fs.copySync(absFile, resFile);
        } catch (err) {
            log('html file', pathURI.toSystemPath(file), 'error');
            log('copy from', pathURI.toSystemPath(absFile), 'error');
            log('copy to', pathURI.toSystemPath(resFile), 'error');
            log('copy file', err.message, 'error');
            process.exit();
        }

        buildMap[absFile] = url = (configs.dest.host ? '' : '/') + path.relative(configs._destPath, resFile);
    }

    return htmlAttr.set(html, attrKey, configs.dest.host + url + suffix);
}
