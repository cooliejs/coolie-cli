/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-21 17:51
 */


'use strict';

var path = require('path');
var fs = require('fs');
var assert = require('assert');

var replaceHTMLAttrStyleResource = require('../../replace/html-attr-style-resource.js');
var file = path.join(__dirname, '../../example/src/html/replace.html');

var code = fs.readFileSync(file, 'utf8');
var srcDirname = path.join(__dirname, '../../example/src/');
var destDirname = path.join(__dirname, '../../example/dest/');
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

        assert.equal(/url\(\/static\/res\/.*?\)/.test(ret), true);
    });
});


