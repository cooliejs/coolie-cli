/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-19 23:08
 */


'use strict';

var htmlAttr = require('../libs/html-attr.js');

var html = '<script \n\t\t\tdata-config="abc.js" \n\n\n\t\tdata-main="def.js" \n\n\n\tcoolie></script>';

// get
console.log(htmlAttr.get(html, 'data-config'));
console.log(htmlAttr.get(html, 'data-main'));
console.log(htmlAttr.get(html, 'coolie'));
console.log(htmlAttr.get(html, 'abc'));


// set
//console.log(htmlAttr.set(html, 'data-main', '00'));
//console.log(htmlAttr.set(html, 'data-m', '00'));
//console.log(htmlAttr.set(html, 'coolie', '00'));


// remove
//console.log(htmlAttr.remove(html, 'data-main'));
//console.log(htmlAttr.remove(html, 'coolie'));
//console.log(htmlAttr.remove(html, 'data-m'));

