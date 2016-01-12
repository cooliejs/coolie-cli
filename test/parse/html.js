/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-12 14:55
 */


'use strict';


var path = require('ydr-utils').path;
var fs = require('fs');

var parseHTML = require('../../parse/html.js');


var file = path.join(__dirname, 'test.html');
var code = fs.readFileSync(file, 'utf8');

describe('parse/html.js', function () {
    it('1', function () {
        var ret = parseHTML().process(code);

        console.log(ret);
    });
});





