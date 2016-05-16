/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-21 17:51
 */


'use strict';

var path = require('ydr-utils').path;
var fs = require('fs');
var assert = require('assert');

var replaceHTMLTagStyleResource = require('../../replace/html-tag-style-resource.js');
var file = path.join(__dirname, 'src/html-tag-style-resource.html');

var code = fs.readFileSync(file, 'utf8');
var srcDirname = path.join(__dirname, 'src/');
var destDirname = path.join(__dirname, 'dest/');
var destResourceDirname = path.join(destDirname, 'res');

describe('replace/html-tag-style-resource.js', function () {
    it('e', function () {
        var ret = replaceHTMLTagStyleResource(file, {
            versionLength: 16,
            srcDirname: srcDirname,
            destDirname: destDirname,
            destHost: '/',
            destResourceDirname: destResourceDirname,
            code: code,
            minifyCSS: true
        });

        console.log(ret);
        assert.equal(/<style>.*<\/style>/m.test(ret.code), true);
    });
});


