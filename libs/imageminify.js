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
 * @param inputFile {String} 图片文件
 * @param callback {Function} 异步回调
 */
module.exports = function (inputFile, callback) {
    var configs = global.configs;
    var originalSize = fs.statSync(inputFile).size;
    var relative = path.relative(configs._srcPath, inputFile);
    var outputFile = path.join(configs._destPath, relative);

    optimage({
        inputFile: inputFile,
        outputFile: outputFile
    }, function (err, res) {
        if (err) {
            log('imageminify', pathURI.toSystemPath(inputFile), 'error');
            log('imageminify', err.message, 'error');
        }

        callback(null);
    });
};
