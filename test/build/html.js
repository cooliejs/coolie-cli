/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-29 10:30
 */


'use strict';

var assert = require('assert');
var path = require('path');

var buildHTML = require('../../build/html.js');

var srcDirname = path.join(__dirname, '../../example/src/');
var srcCoolieConfigBaseDirname = path.join(srcDirname, 'static/js/app/');
var srcMainPath = path.join(srcCoolieConfigBaseDirname, 'index.js');
var destDirname = path.join(__dirname, '../../example/dest/');
var destCoolieConfigJSPath = path.join(destDirname, 'static/js/dwdqwdqwdqwdqwdqwdqw312.js');
var destResourceDirname = path.join(destDirname, 'static/res/');
var destJSDirname = path.join(destDirname, 'static/js/');
var destCSSDirname = path.join(destDirname, 'static/css/');
var mainVersionMap = {};

describe('minify/html.js', function () {
    it('e', function () {

    });
});



