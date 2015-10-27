/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-27 11:36
 */


'use strict';


var assert = require('assert');
var path = require('path');

var buildAPP = require('../../build/app.js');

var srcDirname = path.join(__dirname, '../../example/src/');
var destDirname = path.join(__dirname, '../../example/dest/');
var destResourceDirname = path.join(destDirname, 'static/res/');
var destCoolieConfigBaseDirname = path.join(destDirname, 'static/js/app/');
var destCoolieConfigChunkDirname = path.join(destDirname, 'static/js/chunk/');
var destCoolieConfigAsyncDirname = path.join(destDirname, 'static/js/async/');

describe('build/app.js', function () {
    it('e', function () {
        var ret = buildAPP({
            main: [
                'static/js/app/html1.js',
                'static/js/app/html2.js'
            ],
            chunk: [
                [
                    './static/js/libs1/**'
                ],
                './static/js/libs2/**'
            ],
            srcDirname: srcDirname,
            destDirname: destDirname,
            destResourceDirname: destResourceDirname,
            destCoolieConfigBaseDirname: destCoolieConfigBaseDirname,
            destCoolieConfigChunkDirname: destCoolieConfigChunkDirname,
            destCoolieConfigAsyncDirname: destCoolieConfigAsyncDirname
        });

        console.log(JSON.stringify(ret, null, 4));
    });
});
