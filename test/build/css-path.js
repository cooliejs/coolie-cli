/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-12 19:34
 */


'use strict';

var path = require('ydr-utils').path;
var assert = require('assert');

var buildCSSPath = require('../../build/css-path.js');
var srcDirname = path.join(__dirname, 'src');
var destDirname = path.join(__dirname, 'dest');
var destResourceDirname = path.join(destDirname, 'static/res');
var destCSSDirname = path.join(destDirname, 'static/css');

describe('build/css-path.js', function () {
    it('e', function () {
        var url = '/css-path.css';
        var ret = buildCSSPath(url, {
            file: path.join(srcDirname, 'css-path.html'),
            srcDirname: srcDirname,
            destDirname: destDirname,
            destHost: '/',
            destResourceDirname: destResourceDirname,
            destCSSDirname: destCSSDirname,
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

