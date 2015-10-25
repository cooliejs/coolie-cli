/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-22 16:33
 */


'use strict';

var path = require('path');
var assert = require('assert');
var fs = require('fs');

var minifyCSS = require('../../minify/css.js');

var srcDirname = path.join(__dirname, '../../example/src/');
var destDirname = path.join(__dirname, '../../example/dest/');
var destResourceDirname = path.join(destDirname, 'static/res/');
var destCSSDirname = path.join(destDirname, 'static/css/');
var file = path.join(srcDirname, 'static/css/1.css');

var code = fs.readFileSync(file, 'utf8');

describe('minify/css.js', function () {
    it('one line', function () {
        var ret = minifyCSS(file, {
            code: code
        });

        assert.equal((ret.match(/\n/g) || []).length, 0);
    });

    it('replace css resource', function () {
        var ret = minifyCSS(file, {
            code: code,
            versionLength: 32,
            srcDirname: srcDirname,
            destDirname: destDirname,
            destHost: '/',
            destResourceDirname: destResourceDirname,
            destCSSDirname: destCSSDirname,
            minifyResource: true,
            replaceCSSResource: true
        });

        assert.equal(/\/res\//g.test(ret), true);
        assert.equal((ret.match(/\n/g) || []).length, 0);
    });
});



