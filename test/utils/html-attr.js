/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-22 16:17
 */


'use strict';

var htmlAttr = require('../../utils/html-attr.js');

var html = '<p abc="abc" def ghi="<mno>">';

var abc = htmlAttr.get(html, 'abc');
var def = htmlAttr.get(html, 'def');
var ghi = htmlAttr.get(html, 'ghi');
var mno = htmlAttr.get(html, 'mno');

console.log(abc);
console.log(def);
console.log(ghi);
console.log(mno);

var html1 = htmlAttr.set(html, 'abc', true);
var html2 = htmlAttr.set(html, 'def', Date.now());
console.log(html1);
console.log(html2);


var html3 = htmlAttr.remove(html, 'abc');
var html4 = htmlAttr.remove(html, 'def');
console.log(html3);
console.log(html4);

