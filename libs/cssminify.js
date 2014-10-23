/*!
 * cssminify.js
 * @author ydr.me
 * @create 2014-10-23 19:47
 */


"use strict";

var minifyCSS = require("clean-css");
var minifyCSSOptions = {
    keepSpecialComments: 0,
    keepBreaks: false
};


/**
 * 样式压缩
 * @param code
 * @param callback
 */
module.exports = function (code, callback) {
     try{
         code = new minifyCSS(minifyCSSOptions).minify(code);
         callback(null, code);
     }catch (err){
         callback(err);
     }
};