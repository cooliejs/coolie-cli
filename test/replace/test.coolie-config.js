/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-23 14:30
 */


'use strict';

var assert = require('assert');
var path = require('blear.node.path');
var fs = require('fs');
var encryption = require('blear.node.encryption');

var replaceCoolieConfig = require('../../src/replace/coolie-config.js');

var srcDirname = path.join(__dirname, 'src/');
var file = path.join(srcDirname, 'coolie-config.js');
var destDirname = path.join(__dirname, 'dest/');
var destMainModulesDirname = path.join(destDirname, 'static/js/app/');
var destCoolieConfigAsyncDirname = path.join(destDirname, 'static/js/async/');
var destCoolieConfigChunkDirname = path.join(destDirname, 'static/js/chunk/');
var destJSDirname = path.join(destDirname, 'static/js/');
var testFile1 = path.join(destDirname, 'file1.js');
var testFile2 = path.join(destDirname, 'file2.js');

describe('replace/coolie-config.js', function () {
    it('e', function () {
        var versionMap = {};

        versionMap[testFile1] = encryption.lastModified(testFile1);
        versionMap[testFile2] = encryption.lastModified(testFile2);

        var ret = replaceCoolieConfig(file, {
            versionLength: 32,
            destCoolieConfigMainModulesDir: '/static/js/main/',
            destMainModulesDirname: destMainModulesDirname,
            destAsyncModulesDirname: destCoolieConfigAsyncDirname,
            destChunkModulesDirname: destCoolieConfigChunkDirname,
            srcDirname: srcDirname,
            destDirname: destDirname,
            destJSDirname: destJSDirname,
            versionMap: versionMap,
            destHost: '/',
            coolieConfigs: {
                callbacks: []
            }
        });

        assert.equal(path.isFile(ret), true);
    });
});





