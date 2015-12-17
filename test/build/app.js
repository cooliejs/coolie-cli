/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-27 11:36
 */


'use strict';


var assert = require('assert');
var path = require('ydr-utils').path;

var buildAPP = require('../../build/app.js');

var srcDirname = path.join(__dirname, '../../example/src/');
var destDirname = path.join(__dirname, '../../example/dest/');
var destJSDirname = path.join(destDirname, 'static/js');
var destCSSDirname = path.join(destDirname, 'static/css');
var destResourceDirname = path.join(destDirname, 'static/res/');
var destCoolieConfigBaseDirname = path.join(destDirname, 'static/js/app/');
var destCoolieConfigChunkDirname = path.join(destDirname, 'static/js/chunk/');
var destCoolieConfigAsyncDirname = path.join(destDirname, 'static/js/async/');

describe('build/app.js', function () {
    it('e', function () {
        var ret = buildAPP({
            glob: [
                'static/js/app/html1.js',
                'static/js/app/html2.js',
                'static/js/app/async.js'
            ],
            chunk: [
                [
                    './static/js/libs1/**'
                ],
                './static/js/libs2/**'
            ],
            srcDirname: srcDirname,
            destDirname: destDirname,
            destJSDirname: destJSDirname,
            destCSSDirname: destCSSDirname,
            destResourceDirname: destResourceDirname,
            destCoolieConfigBaseDirname: destCoolieConfigBaseDirname,
            destCoolieConfigChunkDirname: destCoolieConfigChunkDirname,
            destCoolieConfigAsyncDirname: destCoolieConfigAsyncDirname
        });

        console.log(JSON.stringify(ret, null, 4));
    });
});
