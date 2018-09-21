/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-22 10:01
 */


'use strict';

var path = require('blear.node.path');
var fs = require('fs');
var assert = require('assert');

var reader = require('../../src/utils/reader.js');


describe('utils/reader.js', function () {
    it('utf8', function () {
        var textFile = path.join(__dirname, 'src/reader.html');
        var ret1 = reader(textFile, 'utf8');
        var ret2 = reader(textFile, 'utf8');

        assert.equal(ret1, ret2);
    });

    it('binary', function () {
        var binaryFile = path.join(__dirname, 'src/reader.png');
        var ret = reader(binaryFile);

        assert.equal(Buffer.isBuffer(ret), true);
    });
});