/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-31 19:36
 */


'use strict';

var assert = require('assert');
var path = require('path');
var typeis = require('ydr-utils').typeis;

var installFile = require('../../utils/install-file.js');
var pkg = require('../../package.json');

describe('utils/install-file.js', function () {
    it('e', function (done) {
        installFile({
            url: pkg.coolie.modules.coolie.url,
            destDirname: path.join(__dirname, '../../examples/dest/')
        }, function (err, file) {
            assert.equal(typeis.file(file), true);
            done();
        });
    });
});

