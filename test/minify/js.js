/*!
 * JS 压缩
 * @author ydr.me
 * @create 2014-10-23 19:47
 */

'use strict';

var path = require('path');
var fs = require('fs');

var minifyJS = require('../../minify/js.js');
var file = path.join(__dirname, '../../example/src/static/js/index3-1.js');

var code = fs.readFileSync(file, 'utf8');
var ret = minifyJS(file, {
    code: code
});

console.log(ret);

