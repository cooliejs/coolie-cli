/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-29 22:41
 */


'use strict';

var assert = require('assert');
var fse = require('fs-extra');
var typeis = require('ydr-utils').typeis;

var install = require('../../utils/install.js');
var pkg = require('../../package.json');

describe('utils/install.js', function () {
    it('alien', function (done) {
        //install({
        //    destDirname: __dirname,
        //    name: 'alien',
        //    url: pkg.coolie.modules.alien.url
        //}, function (err, unzipDirname) {
        //    console.log(unzipDirname);
        //    assert.equal(typeis.directory(unzipDirname), true);
        //    fse.removeSync(unzipDirname);
        //    done();
        //});
        done();
    });
});


