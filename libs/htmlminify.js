/*!
 * 文件描述
 * @author ydr.me
 * @create 2014-11-03 17:43
 */

'use strict';

var htmlminify = require('html-minifier').minify;
var log = require('./log.js');
var ydrUtil = require('ydr-util');
var options = {
    // 删除注释
    removeComments: true,
    removeCommentsFromCDATA: true,
    removeCDATASectionsFromCDATA: true,
    collapseWhitespace: true,
    preserveLineBreaks: true,
    conservativeCollapse: true
};


/**
 * html minify
 * @param code
 * @param [callback]
 */
module.exports = function (file, code, callback) {
    try {
        code = htmlminify(code, options);

        if (callback) {
            callback(null, code);
        } else {
            return code;
        }
    } catch (err) {
        log('htmlminify', ydrUtil.dato.fixPath(file), 'error');
        log('htmlminify', err.message, 'error');
        process.exit();
    }
};


////////////////////////////////////////////////////////////////////////
//
//var html = '<p>123</p><!--呵呵--->\n\n\n<br>';
//
//module.exports('', html, function () {
//    console.log(arguments);
//});
