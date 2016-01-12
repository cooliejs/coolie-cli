/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-12 14:55
 */


'use strict';


var path = require('ydr-utils').path;
var dato = require('ydr-utils').dato;
var fs = require('fs');

var parseHTML = require('../../parse/html.js');


var file = path.join(__dirname, 'test.html');
var code = fs.readFileSync(file, 'utf8');

describe('parse/html.js', function () {
    it('1', function () {
        var ret = parseHTML(code)
            .use(function (tree) {
                tree.match({
                    tag: 'meta'
                }, function (node) {
                    if (node.attrs.charset) {
                        return {
                            tag: 'meta',
                            attrs: {
                                charset: 'gbk'
                            }
                        };
                    } else {
                        return node;
                    }
                });
            })
            .get();

        console.log('\n\n------------------------------------------');
        console.log(ret);
    });
});





