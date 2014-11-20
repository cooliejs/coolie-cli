/*!
 * html 文件的内容替换
 * @author ydr.me
 * @create 2014-11-14 13:39
 */

'use strict';

var path = require('path');
var fs = require('fs');
var ydrUtil = require('ydr-util');
var log = require('./log.js');
var cssminify = require('./cssminify.js');
var htmlminify = require('./htmlminify.js');
var REG_BEGIN = /<!--\s*?coolie\s*?-->/ig;
var REG_END = /<!--\s*?\/coolie\s*?-->/i;
var REG_LINK = /<link\b[^>]*?\bhref\b\s*?=\s*?['"](.*?)['"][^>]*?>/g;
var REG_COOLIE = /<!--\s*?coolie\s*?-->([\s\S]*?)<!--\s*?\/coolie\s*?-->/ig;
// 相同的组合只产生出一个文件
var concatMap = {};


/**
 * 提取 CSS 依赖并合并依赖
 * @param file {String} HTML 文件路径
 * @param data {String} HTML 文件内容
 * @param cssPath {String} 生成CSS文件路径
 * @returns {{concat: Array, data: *}}
 */
module.exports = function (file, data, cssPath) {
    var matches = data.split(REG_BEGIN);
    var concat = [];
    var replaceIndex = 0;
    var dirname = path.dirname(file);

    // 循环匹配 <!--coolie-->(matched)<!--/coolie-->
    matches.forEach(function (matched) {
        var array = matched.split(REG_END);
        var link = array[0];
        var hrefMatches;
        var files = [];
        var relativePath = path.relative(dirname, cssPath);
        var md5List = '';
        var fileName;
        var filePath;
        var fileURL;
        var findMath = null;
        var file;

        if (array.length === 2) {
            while ((hrefMatches = REG_LINK.exec(link))) {
                file = path.join(dirname, hrefMatches[1]);
                files.push(file);
                md5List += ydrUtil.crypto.etag(file);
            }
        }

        ydrUtil.dato.each(concatMap, function (name, matched) {
            if (matched.files.length !== files.length) {
                return false;
            }

            var compare = ydrUtil.dato.compare(matched.files, files);

            // 完全匹配
            if (compare && compare.different.length === 0) {
                findMath = ydrUtil.dato.extend(true, {}, matched);
                return false;
            }
        });

        if (findMath) {
            filePath = path.join(relativePath, findMath.name);
            fileURL = ydrUtil.dato.toURLPath(filePath);
            findMath.url = fileURL;
            findMath.isRepeat = true;
            concat.push(findMath);
        } else {
            if (files.length) {
                fileName = ydrUtil.crypto.md5(md5List).slice(0, 8) + '.css';
                filePath = path.join(relativePath, fileName);
                fileURL = ydrUtil.dato.toURLPath(filePath);
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

    return {
        concat: concat,
        data: htmlminify(file, data)
    };
};


/////////////////////////////////////////////////////
//var filePath = path.join(__dirname, '../example/src/html/index.html');
//var html = fs.readFileSync(filePath, 'utf8');
//var cssPath =  path.join(__dirname, '../example/src/static/css/');
//
//html = module.exports(filePath, html, cssPath);
//
//console.log(html);
//
