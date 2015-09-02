/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-06-09 22:57
 */


'use strict';

//var optimage = require('optimage');
//var path = require('ydr-utils').path;
//var fse = require('fs-extra');
//var log = require('./log.js');
//var pathURI = require('./path-uri.js');
//var number = require('ydr-utils').number;


/**
 * 图片压缩
 * @param inputFile {String} 图片文件
 * @param callback {Function} 异步回调
 */
module.exports = function (inputFile, callback) {
    //var configs = global.configs;
    //var originalSize = fse.statSync(inputFile).size;
    //var outputFile = configs._resImageMap[inputFile];
    //
    //fse.ensureFileSync(outputFile);
    //optimage({
    //    inputFile: inputFile,
    //    outputFile: outputFile
    //}, function (err, res) {
    //    //if (err) {
    //    //    log('imageminify', pathURI.toSystemPath(inputFile), 'error');
    //    //    log('imageminify', err.message, 'error');
    //    //}
    //
    //    var saved = number.parseFloat(res && res.saved, 0);
    //
    //    callback(null, originalSize - saved, originalSize);
    //});
};
