/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-26 18:10
 */


'use strict';

var assert = require('assert');
var path = require('ydr-utils').path;

var buildMain = require('../../build/main.js');

var srcDirname = path.join(__dirname, '../../example/src/');
var destDirname = path.join(__dirname, '../../example/dest/');
var destResourceDirname = path.join(destDirname, 'static/res/');
var destCoolieConfigBaseDirname = path.join(destDirname, 'static/js/app/');


describe('build/module.js', function () {
    it('sync', function () {
        var mainFile = path.join(srcDirname, 'static/js/app/index.js');
        var ret = buildMain(mainFile, {
            inType: 'js',
            outType: 'js',
            async: false,
            chunk: false,
            main: mainFile,
            srcDirname: srcDirname,
            destDirname: destDirname,
            destResourceDirname: destResourceDirname,
            destHost: '/',
            destCoolieConfigBaseDirname: destCoolieConfigBaseDirname
        });

        assert.equal(ret.dependencies.length, 6);
    });

    it('async', function () {
        var mainFile = path.join(srcDirname, 'static/js/app/async.js');
        var ret = buildMain(mainFile, {
            inType: 'js',
            outType: 'js',
            async: true,
            chunk: false,
            main: mainFile,
            srcDirname: srcDirname,
            destDirname: destDirname,
            destResourceDirname: destResourceDirname,
            destHost: '/',
            destCoolieConfigBaseDirname: destCoolieConfigBaseDirname
        });

        //console.log(dependencies[0].buffer.toString('utf8'));
        assert.equal(ret.dependencies.length, 7);
    });
});
