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
var file = path.join(__dirname, '../../example/src/html/css.html');

var code = fs.readFileSync(file, 'utf8');
var srcDirname = path.join(__dirname, '../../example/src/');
var destDirname = path.join(__dirname, '../../example/dest/');
var destCSSDirname = path.join(destDirname, 'static/css');
var destResourceDirname = path.join(destDirname, 'static/res');

describe('replace/html-attr-script.js', function () {
    it('e', function () {
        var ret = replaceHTMLTagLink(file, {
            code: code,
            srcDirname: srcDirname,
            destDirname: destDirname,
            destCSSDirname: destCSSDirname,
            destResourceDirname: destResourceDirname,
            destHost: 'http://abc.com/'
        }).code;

        console.log('===========================\n');
        console.log(ret);
        assert.equal(ret.indexOf('href="http://abc.com/static/css/') > -1, true);
        console.log('\n===========================');
    });
});



