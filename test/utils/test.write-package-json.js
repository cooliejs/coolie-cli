/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-13 16:38
 */


'use strict';

var assert = require('assert');
var path = require('ydr-utils').path;
var typeis = require('ydr-utils').typeis;

var writePackageJSON = require('../../src/utils/write-package-json');

describe('utils/write-package-json', function () {
    it('e', function () {
        var json = {};

        writePackageJSON(json, __dirname);

        var file = path.join(__dirname, 'package.json');
        assert.equal(typeis.file(file), true);
    });
});


