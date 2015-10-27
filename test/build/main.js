/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-26 18:10
 */


'use strict';

var assert = require('assert');
var path = require('path');

var buildMain = require('../../build/main.js');

var srcDirname = path.join(__dirname, '../../example/src/');
var destDirname = path.join(__dirname, '../../example/dest/');
var destResourceDirname = path.join(destDirname, 'static/res/');
var destCoolieConfigBaseDirname = path.join(destDirname, 'static/js/app/');


describe('build/module.js', function () {
    var mainFile = path.join(srcDirname, 'static/js/app/index.js');

    it('main', function () {
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

        console.log(ret);
    });
});
