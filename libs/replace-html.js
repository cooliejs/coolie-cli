/*!
 * html 文件的内容替换
 * @author ydr.me
 * @create 2014-11-14 13:39
 */

'use strict';

var path = require('path');
var fs = require('fs');
var util = require('./util.js');
var log = require('./log.js');
var cssminify = require('./cssminify.js');
var htmlminify = require('./htmlminify.js');
var REG_BEGIN = /<!--\s*?coolie\s*?-->/ig;
var REG_END = /<!--\s*?\/coolie\s*?-->/i;
var REG_LINK = /<link\b[^>]*?\bhref\b\s*?=\s*?['"](.*?)['"][^>]*?>/g;
var REG_COOLIE = /<!--\s*?coolie\s*?-->([\s\S]*?)<!--\s*?\/coolie\s*?-->/ig;


module.exports = function (file, data, cssPath) {
    var matches = data.split(REG_BEGIN);
    var concat = [];
    var replaceIndex = 0;
    var dirname = path.dirname(file);

    matches.forEach(function (matched) {
        var array = matched.split(REG_END);
        var link = array[0];
        var hrefMatches;
        var files = [];
        var relativePath = path.relative(dirname, cssPath);
        var fileName = util.randomString(20) + '.css';
        var filePath = path.join(relativePath, fileName);
        var fileURL = util.toURLPath(filePath);

        if (array.length === 2) {
            while ((hrefMatches = REG_LINK.exec(link))) {
                files.push(path.join(dirname, hrefMatches[1]));
            }
        }

        //files.forEach(function (file) {
        //    var data;
        //    try {
        //        data = fs.readFileSync(file, 'utf8');
        //        data = cssminify(file, data);
        //        bufferList.push(new Buffer(data + '\n', 'utf8'));
        //    } catch (err) {
        //        log('replace html', util.fixPath(file), 'error');
        //        log('replace html', err.message, 'error');
        //        process.exit();
        //    }
        //});

        if (files.length) {
            concat.push({
                name: fileName,
                url: fileURL,
                files: files
            });
        }
    });


    data = data.replace(REG_COOLIE, function($0, $1){
        return $1 ? '<link rel="stylesheet" href="'+concat[replaceIndex++].url+'"/>' : $0;
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
