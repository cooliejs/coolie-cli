/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-22 10:01
 */


'use strict';

var path = require('path');
var fs = require('fs');
var assert = require('assert');

var reader = require('../../utils/reader.js');


describe('utils/reader.js', function () {
    it('utf8', function () {
        var textFile = path.join(__dirname, '../../example/src/html/replace.html');
        var ret1 = reader(textFile, 'utf8');
        var ret2 = reader(textFile, 'utf8');

        assert.equal(ret1, ret2);
    });

    it('binary', function () {
        var binaryFile = path.join(__dirname, '../../example/src/favicon.ico');
        var ret = reader(binaryFile);

        assert.equal(Buffer.isBuffer(ret), true);
    });
});