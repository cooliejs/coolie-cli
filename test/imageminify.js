/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-06-09 22:08
 */


'use strict';


var path = require('path');
var fs = require('fs');
var log = require('../libs/log.js');
var pathURI = require('../libs/path-uri.js');
var pngFile = path.join(__dirname, '../example/src/static/img/100x100.png');
var jpgFile = path.join(__dirname, '../example/src/static/img/girl.jpg');
var gifFile = path.join(__dirname, '../example/src/static/img/loading.gif');
//var imagemin = require('image-min');

//var src = fs.createReadStream(imgFile);
//var ext = path.extname(src.path);
//
//src
//    .pipe(imagemin({ ext: ext }))
//    .pipe(fs.createWriteStream('img-minified' + ext));

var optimage = require('optimage');

optimage({
    inputFile: gifFile,
    outputFile: './test.gif'
}, function(err, res){
    // res.inputFile
    // res.outputFile
    // res.saved();

    //if (err) {
    //    log('imageminify', pathURI.toSystemPath(''), 'error');
    //    log('imageminify', err.message, 'error');
    //    return process.exit(-1);
    //}

    console.log(err);
    console.log(res);
});

//optimage({
//    inputFile: pngFile,
//    outputFile: path.join(__dirname, 'min.png')
//}, function(err, res){
//    // res.inputFile
//    // res.outputFile
//    // res.saved();
//});

//optimage({
//    inputFile: jpgFile,
//    outputFile: "test.min.jpg"
//}, function(err, res){
//    // res.inputFile
//    // res.outputFile
//    // res.saved();
//});

//optimage({
//    inputFile: gifFile,
//    outputFile: "test.min.gif"
//}, function(err, res){
//    // res.inputFile
//    // res.outputFile
//    // res.saved();
//});
