/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-12 14:55
 */


'use strict';


var path = require('ydr-utils').path;
var fs = require('fs');

var parseHTML = require('../../parse/html-new.js');


var file = path.join(__dirname, 'test.html');
var code = fs.readFileSync(file, 'utf8');

describe('parse/html.js', function () {
    it('1', function () {
        var ret = parseHTML(code, {
            tag: 'body'
        }, function (node) {
            node.attrs.abc = 123;
            return node;
        });

        console.log(ret);
    });
});





