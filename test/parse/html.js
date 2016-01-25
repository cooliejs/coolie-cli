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
    it('parseHTML', function () {
        var ret = parseHTML(code)
            //.match({
            //    tag: 'body'
            //}, function (node) {
            //    node.attrs.abc = 123;
            //    node.attrs.coolieignore = false;
            //    return node;
            //})
            //.match('html', function (node) {
            //    node.attrs.lang += '-xxx';
            //    return node;
            //})
            .match({
                tag: 'link',
                attrs: {
                    type: 'image/x-icon'
                }
            }, function (node) {
                node.attrs.class = 'favicon';
                return node;
            })
            .exec();

        console.log('----------------------------------------------');
        console.log(ret);
    });
});





