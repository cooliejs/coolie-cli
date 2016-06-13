/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-12 19:34
 */


'use strict';

var path = require('ydr-utils').path;
var assert = require('assert');

var buildJSPath = require('../../src/build/js-path.js');
var srcDirname = path.join(__dirname, 'src');
var destDirname = path.join(__dirname, 'dest');
var destResourceDirname = path.join(destDirname, 'static/res');
var destJSDirname = path.join(destDirname, 'static/js');

describe('build/js-path.js', function () {
    it('e', function () {
        var url = 'js-path.js';
        var ret = buildJSPath(url, {
            file: path.join(srcDirname, 'js-path.html'),
            srcDirname: srcDirname,
            destDirname: destDirname,
            destHost: '/',
            destResourceDirname: destResourceDirname,
            destJSDirname: destJSDirname,
            minifyCSS: true,
            minifyResource: true,
            versionLength: 32,
            signCSS: true,
            cleanCSSOptions: null
        });

        console.log('\n\n-----------------------------------------------');
        console.log(ret);
        assert.equal(url !== ret.url, true);
    });
});

