/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-23 10:49
 */


'use strict';

var path = require('path');
var fs = require('fs');
var assert = require('assert');

var replaceHTMLCoolieGroup = require('../../replace/html-coolie-group.js');
var file = path.join(__dirname, '../../example/src/html/index3.html');
var srcDirname = path.join(__dirname, '../../example/src/');
var destDirname = path.join(__dirname, '../../example/dest/');
var destResourceDirname = path.join(destDirname, 'res');
var destCSSDirname = path.join(destDirname, 'static/css/');
var destJSDirname = path.join(destDirname, 'static/js/');

describe('replace/html-coolie-group.js', function () {
    it('e', function () {
        var code = fs.readFileSync(file, 'utf8');
        var ret = replaceHTMLCoolieGroup(file, {
            code: code,
            srcDirname: srcDirname,
            destDirname: destDirname,
            destResourceDirname: destResourceDirname,
            destHost: '/',
            destCSSDirname: destCSSDirname,
            destJSDirname: destJSDirname,
            replaceCSSResource: true
        });

        assert.equal(/<!--coolie-->/g.test(ret), false);
    });
});



