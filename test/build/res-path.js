/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-12 19:34
 */


'use strict';

var path = require('ydr-utils').path;
var assert = require('assert');

var buildResPath = require('../../build/res-path.js');
var srcDirname = path.join(__dirname, 'src');
var destDirname = path.join(__dirname, 'dest');
var destResourceDirname = path.join(destDirname, 'static/res');

describe('build/res-path.js', function () {
    it('e', function () {
        var url = './res-path.png';
        var ret = buildResPath(url, {
            file: path.join(srcDirname, 'res-path.html'),
            srcDirname: srcDirname,
            destDirname: destDirname,
            destHost: '/',
            destResourceDirname: destResourceDirname,
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

