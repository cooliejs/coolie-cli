/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-05-19 23:08
 */


'use strict';

var htmlAttr = require('../libs/html-attr.js');

var html = '<script coolie src="../static/js/coolie.min.js"\n\
    data-config="./coolie-config.js"\n\
    data-main="./index.js"></script>';

// get
console.log(htmlAttr.get(html, 'src'));
console.log(htmlAttr.get(html, 'data-config'));
console.log(htmlAttr.get(html, 'data-main'));
console.log(htmlAttr.get(html, 'coolie'));
console.log(htmlAttr.get(html, 'abc'));


// set
//console.log(html = htmlAttr.set(html, 'src', 'http://abc.com/1.js'));
//console.log(html = htmlAttr.set(html, 'data-main', '00'));
//console.log(html = htmlAttr.set(html, 'data-config', '11'));
//console.log(html = htmlAttr.set(html, 'data-m', '22'));
//console.log(htmlAttr.set(html, 'coolie', '33'));


// remove
console.log(html = htmlAttr.remove(html, 'data-main'));
console.log(html = htmlAttr.remove(html, 'coolie'));
console.log(htmlAttr.remove(html, 'data-m'));

