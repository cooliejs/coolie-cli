/**
 * 文件描述
 * @author ydr.me
 * @create 2015-11-03 17:32
 */


'use strict';

var assert = require('assert');
var path = require('ydr-utils').path;
var typeis = require('ydr-utils').typeis;

var buildMap = require('../../build/map.js');

var srcDirname = path.join(__dirname, '../../example/src');
var destDirname = path.join(__dirname, '../../example/dest');
var destCoolieConfigBaseDirname = path.join(destDirname, 'app');
var destCoolieConfigChunkDirname = path.join(destDirname, 'chunk');
var destCoolieConfigAsyncDirname = path.join(destDirname, 'async');

describe('build/map.js', function () {
    it('e', function(){
        var destPath = buildMap({
            srcDirname: srcDirname,
            destDirname: destDirname,
            destCoolieConfigBaseDirname: destCoolieConfigBaseDirname,
            destCoolieConfigChunkDirname: destCoolieConfigChunkDirname,
            destCoolieConfigAsyncDirname: destCoolieConfigAsyncDirname,
            buildAPPResult: {
                mainVersionMap: {},
                asyncVersionMap: {},
                appMap: {}
            },
            buildHTMLResult: {
                htmlJSMap: {},
                htmlCSSMap: {},
                htmlMainMap: {}
            }
        });

        assert.equal(typeis.file(destPath), true);
    });
});
