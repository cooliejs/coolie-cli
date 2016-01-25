/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-25 10:46
 */


'use strict';

var path = require('path');
var fs = require('fs');
var debug = require('ydr-utils').debug;


var html = fs.readFileSync(path.join(__dirname, 'test.html'), 'utf8');


var matchHTML = function (html, conditions, transform) {

};
