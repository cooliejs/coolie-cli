/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-06-09 22:08
 */


'use strict';


var path = require('path');
var fs = require('fs');
var pngFile = path.join(__dirname, '../example/src/static/img/logo_03.png');
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
