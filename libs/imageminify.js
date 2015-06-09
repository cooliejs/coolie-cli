/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-06-09 22:57
 */


'use strict';

var optimage = require('optimage');
var path = require('path');
var fs = require('fs');
var log = require('./log.js');
var pathURI = require('./path-uri.js');
var tempDir = '__temp__' + Date.now();


/**
 * 图片压缩
 * @param file {String} 图片文件
 * @param callback {Function} 异步回调
 */
module.exports = function (file, callback) {
    var configs = global.configs;
    var originalSize = fs.statSync(file).size;
    var relative = path.relative(configs._destPath, file);
    var tempFile = path.join(configs._destPath, tempDir, relative);
    var extname = path.extname(file);

    console.log(file);
    optimage({
        inputFile: file,
        outputFile: tempFile
    }, function (err, res) {
        if (err) {
            log('imageminify', pathURI.toSystemPath(file), 'error');
            log('imageminify', err.message, 'error');
            return process.exit(-1);
        }

        callback(null, res.saved, originalSize);
    });
};
