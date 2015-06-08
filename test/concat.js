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
    _destPath: path.join(__dirname, '../example/dest/'),
    _cssPath: path.join(__dirname, '../example/src/static/css/'),
    _jsPath: path.join(__dirname, '../example/src/static/js/'),
    dest: {
        host: '/'
    },
    css: {
        minify: true
    },
    _resVerMap: {},
    _resDestMap: {},
    resource: {
        dest: './static/res/'
    }
};

var ret1 = concat(file, '<script src="../static/js/index3-1.js"></script>\
    <script src="../static/js/index3-2.js"></script>', {
    type: 'js'
});
console.log(ret1);


var ret2 = concat(file, ' <link rel="stylesheet" href="../static/css/1.css"/>\
    <link rel="stylesheet" href="/static/css/2.css"/>', {
    type: 'css'
});


console.log(ret2);
