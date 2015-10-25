/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-23 14:30
 */


'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var encryption = require('ydr-utils').encryption;
var typeis = require('ydr-utils').typeis;

var replaceCoolieConfig = require('../../replace/coolie-config.js');
var file = path.join(__dirname, '../../example/src/static/js/coolie-config.js');

var code = fs.readFileSync(file, 'utf8');
var srcDirname = path.join(__dirname, '../../example/src/');
var destDirname = path.join(__dirname, '../../example/dest/');
var srcCoolieConfigJSPath = path.join(srcDirname, 'static/js/coolie-config.js');
var srcCoolieConfigAsyncDirname = path.join(srcDirname, 'static/js/async/');
var srcCoolieConfigChunkDirname = path.join(srcDirname, 'static/js/chunk/');
var destJSDirname = path.join(destDirname, 'static/js/');
var testFile1 = path.join(srcDirname, 'static/js/index3-1.js');
var testFile2 = path.join(srcDirname, 'static/js/app/user/index.js');

describe('replace/coolie-config.js', function () {
    it('e', function () {
        var versionMap = {};
        versionMap[testFile1] = encryption.lastModified(testFile1);
        versionMap[testFile2] = encryption.lastModified(testFile2);

        var ret = replaceCoolieConfig(file, {
            versionLength: 32,
            srcDirname: srcDirname,
            srcCoolieConfigJSPath: srcCoolieConfigJSPath,
            srcCoolieConfigAsyncDirname: srcCoolieConfigAsyncDirname,
            srcCoolieConfigChunkDirname: srcCoolieConfigChunkDirname,
            destDirname: destDirname,
            destJSDirname: destJSDirname,
            versionMap: versionMap,
            destHost: '/',
            code: code
        });

        assert.equal(typeis.file(ret.destCoolieConfigJSPath), true);
        assert.equal(typeis.directory(ret.srcCoolieConfigBaseDirname), true);
    });
});





