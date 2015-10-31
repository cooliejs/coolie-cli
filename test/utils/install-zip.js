/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-29 22:41
 */


'use strict';

var assert = require('assert');
var fse = require('fs-extra');
var typeis = require('ydr-utils').typeis;

var downZip = require('../../utils/install-zip.js');
var pkg = require('../../package.json');

describe('utils/down-zip.js', function () {
    it('alien', function (done) {
        downZip({
            destDirname: __dirname,
            name: 'alien',
            url: pkg.coolie.modules.alien.url
        }, function (err, unzipDirname) {
            console.log(unzipDirname);
            assert.equal(typeis.directory(unzipDirname), true);
            fse.removeSync(unzipDirname);
            done();
        });
    });
});


