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

describe('build/app.js', function () {
    it('e', function () {
        buildAPP({
            main: [
                'static/js/app/**'
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
            destCoolieConfigBaseDirname: destCoolieConfigBaseDirname
        });
    });
});
