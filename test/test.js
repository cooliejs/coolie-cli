/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-25 10:46
 */


'use strict';

var htmlparser = require('htmlparser2');
var cheerio = require('cheerio');
var path = require('path');
var fs = require('fs');
var debug = require('ydr-utils').debug;


var html = fs.readFileSync(path.join(__dirname, 'test.html'), 'utf8');
var $ = cheerio.load(html);

console.log($('html').length);
