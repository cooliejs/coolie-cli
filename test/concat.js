/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-06-08 23:35
 */


'use strict';

var path = require('path');
var file = path.join(__dirname, '../example/src/html/index3.html');
var concat = require('../libs/concat.js');

global.configs = {
    _srcPath: path.join(__dirname, '../example/src/'),
    _jsPath: path.join(__dirname, '../example/src/static/js/')
};

var ret = concat(file, '<script src="../static/js/index3-1.js"></script>\
    <script src="../static/js/index3-2.js"></script>', {
    type: 'js'
});


console.log(ret);
