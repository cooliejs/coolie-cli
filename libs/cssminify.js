/*!
 * cssminify.js
 * @author ydr.me
 * @create 2014-10-23 19:47
 */


"use strict";

var minifyCSS = require("clean-css");
var log = require('./log.js');
var util = require('./util.js');
var options = {
    keepSpecialComments: 0,
    keepBreaks: false
};


/**
 * 样式压缩
 * @param code
 * @param callback
 */
module.exports = function (file, code, callback) {
     try{
         code = new minifyCSS(options).minify(code);
         callback(null, code);
     }catch (err){
         log('cssminify', util.fixPath(file), 'error');
         log('cssminify', err.message, 'error');
         process.exit();
     }
};