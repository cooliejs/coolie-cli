/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-22 18:56
 */


'use strict';

var path = require('ydr-utils').path;
var fs = require('fs');
var assert = require('assert');

var replaceHTMLTagLink = require('../../replace/html-tag-link.js');
var file = path.join(__dirname, 'src/html-tag-link.html');

var code = fs.readFileSync(file, 'utf8');
var srcDirname = path.join(__dirname, 'src/');
var destDirname = path.join(__dirname, '.dest/');
var destCSSDirname = path.join(destDirname, 'static/css');
var destResourceDirname = path.join(destDirname, 'static/res');

describe('replace/html-tag-link.js', function () {
    it('e', function () {
        var ret = replaceHTMLTagLink(file, {
            code: code,
            srcDirname: srcDirname,
            destDirname: destDirname,
            destCSSDirname: destCSSDirname,
            destResourceDirname: destResourceDirname
        });

        console.log('\n\n-----------------------------------------');
        console.log(ret.code);
        assert.equal(/\n/.test(ret.code), false);
        assert.equal(ret.cssList.length > 0, true);
    });
});



