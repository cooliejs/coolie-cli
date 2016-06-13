/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-21 17:51
 */


'use strict';

var path = require('ydr-utils').path;
var fs = require('fs');
var assert = require('assert');

var replaceHTMLAttrResource = require('../../src/replace/html-attr-resource.js');
var file = path.join(__dirname, 'src/html-attr-resource.html');

var code = fs.readFileSync(file, 'utf8');
var srcDirname = path.join(__dirname, 'src/');
var destDirname = path.join(__dirname, 'dest/');
var destResourceDirname = path.join(destDirname, 'static/res/');

describe('replace/html-attr-resource.js', function () {
    it('e', function () {
        var ret = replaceHTMLAttrResource(file, {
            versionLength: 16,
            srcDirname: srcDirname,
            destDirname: destDirname,
            destHost: '/',
            destResourceDirname: destResourceDirname,
            code: code
        }).code;
        var REG_LINK = /<link[\s\S]*?href="\/static\/res\//;
        var REG_IMG = /<img[\s\S]*?src="\/static\/res\//;

        console.log('---------------------------------------');
        console.log(ret);
        assert.equal(REG_LINK.test(ret), true);
        assert.equal(REG_IMG.test(ret), true);
    });
});


