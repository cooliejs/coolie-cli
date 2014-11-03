/*!
 * 文件描述
 * @author ydr.me
 * @create 2014-11-03 17:43
 */

'use strict';

var htmlminify = require('html-minifier').minify;
var log = require('./log.js');
var util = require('./util.js');
var options = {
    collapseWhitespace: true,
    preserveLineBreaks: true,
    conservativeCollapse: true
};


/**
 * html minify
 * @param code
 * @param callback
 */
module.exports = function (file, code, callback) {
    try {
        code = htmlminify(code, options);
        callback(null, code);
    } catch (err) {
        log('htmlminify', util.fixPath(file), 'error');
        log('htmlminify', err.message, 'error');
        process.exit();
    }
};
//
//
//var html = '<p>123</p>\n\n\n<br>';
//
//module.exports(html, function () {
//    console.log(arguments);
//});
