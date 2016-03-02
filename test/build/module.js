/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-26 15:46
 */


'use strict';


var assert = require('assert');
var path = require('ydr-utils').path;

var buildModule = require('../../build/module.js');

var srcDirname = path.join(__dirname, '../../example/src/');
var destDirname = path.join(__dirname, '../../example/dest/');
var destCSSDirname = path.join(destDirname, 'static/css/');
var destResourceDirname = path.join(destDirname, 'static/res/');

describe('build/module.js', function () {
    var mainFile = path.join(srcDirname, 'static/js/app/index.js');

    //it('sync:js|js', function () {
    //    var ret = buildModule(mainFile, {
    //        inType: 'js',
    //        outType: 'js',
    //        async: false,
    //        chunk: false,
    //        main: mainFile
    //    });
    //
    //    var REG_CODE = /^define\("0",.*?\);$/;
    //
    //    console.log(ret.code);
    //    assert.equal(ret.dependencies.length > 1, true);
    //    assert.equal(REG_CODE.test(ret.code), true);
    //});
    //
    //it('sync:css|text', function () {
    //    var file = path.join(srcDirname, 'static/js/libs2/some.css');
    //
    //    var ret = buildModule(file, {
    //        inType: 'css',
    //        outType: 'text',
    //        chunk: false,
    //        main: mainFile,
    //        srcDirname: srcDirname,
    //        destDirname: destDirname,
    //        destResourceDirname: destResourceDirname,
    //        destHost: '/'
    //    });
    //
    //    var REG_CODE = /^define\("[a-z\d]*?",.*?\);$/;
    //
    //    console.log(ret.code);
    //    assert.equal(ret.dependencies.length === 0, true);
    //    assert.equal(REG_CODE.test(ret.code), true);
    //});
    //
    //it('sync:html|base64', function () {
    //    var file = path.join(srcDirname, 'static/js/libs2/some.html');
    //
    //    var ret = buildModule(file, {
    //        inType: 'html',
    //        outType: 'base64',
    //        chunk: false,
    //        main: mainFile,
    //        srcDirname: srcDirname,
    //        destDirname: destDirname,
    //        destResourceDirname: destResourceDirname,
    //        destHost: '/'
    //    });
    //
    //    var REG_CODE = /^define\("[a-z\d]*?",.*?\);$/;
    //
    //    console.log(ret.code);
    //    assert.equal(ret.dependencies.length === 0, true);
    //    assert.equal(REG_CODE.test(ret.code), true);
    //});

    it('async:js|js', function () {
        var file = path.join(srcDirname, 'static/js/app/async.js');

        var ret = buildModule(file, {
            inType: 'js',
            outType: 'js',
            chunk: false,
            main: file,
            srcDirname: srcDirname,
            destDirname: destDirname,
            destResourceDirname: destResourceDirname,
            destHost: '/',
            virtualMap: {}
        });

        var REG_CODE = /^define\("[a-z\d]*?",.*?\);$/;

        console.log(ret.code);
        //assert.equal(ret.dependencies.length === 0, true);
        //assert.equal(REG_CODE.test(ret.code), true);
    });
});

