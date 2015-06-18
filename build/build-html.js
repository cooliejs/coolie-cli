/*!
 * build-html.js
 * @author ydr.me
 * @create 2014年11月14日14:37:55
 */

'use strict';

var fs = require('fs-extra');
var path = require('path');
var log = require('../libs/log.js');
var dato = require('ydr-utils').dato;
var replaceHtml = require('../libs/replace-html.js');
var pathURI = require('../libs/path-uri.js');
var cssLength = 0;


/**
 * 构建一个 HTML 文件
 * @param file {String} 源文件
 * @param callback {Function} 回调
 */
module.exports = function (file, callback) {
    var configs = global.configs;
    var srcPath = configs._srcPath;
    var destPath = configs._destPath;

    fs.readFile(file, 'utf8', function (err, code) {
        if (err) {
            log("read file", pathURI.toSystemPath(file), "error");
            log('read file', err.message, 'error');
            process.exit(1);
        }

        var ret = replaceHtml(file, code);

        //log('build html', pathURI.toSystemPath(file), 'warning');

        var relative = path.relative(srcPath, file);
        var destFile = path.join(destPath, relative);

        try {
            fs.outputFileSync(destFile, ret.code, 'utf8');
        } catch (err) {
            log("write file", pathURI.toSystemPath(destFile), "error");
            log('write file', err.message, 'error');
            process.exit(1);
        }

        //dato.each(ret.depCSS, function (name, dep) {
        //    cssLength += dep.length;
        //});
        //
        //dato.each(ret.depCSS, function (name, dep) {
        //    cssLength += dep.length;
        //});

        callback(null, ret.depCSS,ret.depJS, ret.mainJS);
    });
};