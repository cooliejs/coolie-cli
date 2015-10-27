/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-26 15:46
 */


'use strict';


var assert = require('assert');
var path = require('path');

var buildModule = require('../../build/module.js');

var srcDirname = path.join(__dirname, '../../example/src/');
var destDirname = path.join(__dirname, '../../example/dest/');
var destCSSDirname = path.join(destDirname, 'static/css/');
var destResourceDirname = path.join(destDirname, 'static/res/');

describe('build/module.js', function () {
    var mainFile = path.join(srcDirname, 'static/js/app/index.js');

    it('sync:js', function () {
        var ret = buildModule(mainFile, {
            inType: 'js',
            outType: 'js',
            async: false,
            chunk: false,
            main: mainFile
        });

        var REG_CODE = /^define\("0",.*?\);$/;

        console.log(ret.code);
        assert.equal(ret.dependencies.length > 1, true);
        assert.equal(REG_CODE.test(ret.code), true);
    });

    xit('sync:css', function () {
        var file = path.join(srcDirname, 'static/js/libs2/some.css');

        var ret = buildModule(file, {
            inType: 'css',
            outType: 'css',
            async: false,
            chunk: false,
            main: mainFile,
            srcDirname: srcDirname,
            destDirname: destDirname,
            destResourceDirname: destResourceDirname,
            destHost: '/'
        });

        var REG_CODE = /^define\("[a-z\d]*?",.*?\);$/;

        assert.equal(ret.dependencies.length === 0, true);
        assert.equal(REG_CODE.test(ret.code), true);
    });
});

