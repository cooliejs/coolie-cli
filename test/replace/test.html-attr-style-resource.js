/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-21 17:51
 */


'use strict';

var path = require('blear.node.path');
var fs = require('fs');
var assert = require('assert');

var replaceHTMLAttrStyleResource = require('../../src/replace/html-attr-style-resource.js');
var file = path.join(__dirname, './src/html-attr-style-resource.html');

var code = fs.readFileSync(file, 'utf8');
var srcDirname = path.join(__dirname, 'src/');
var destDirname = path.join(__dirname, 'dest/');
var destResourceDirname = path.join(destDirname, 'static/res');

describe('replace/html-attr-style-resource.js', function () {
    it('e', function () {
        var ret = replaceHTMLAttrStyleResource(file, {
            versionLength: 16,
            srcDirname: srcDirname,
            destDirname: destDirname,
            destHost: '/',
            destResourceDirname: destResourceDirname,
            code: code,
            minifyCSS: true
        });

        console.log('\n\n----------------------------------');
        console.log(ret.code);
        assert.equal(/url\(\/static\/res\/.*?\)/.test(ret.code), true);
    });
});


