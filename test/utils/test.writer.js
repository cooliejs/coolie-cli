/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-27 23:51
 */


'use strict';

var assert = require('assert');
var path = require('blear.node.path');
var typeis = require('blear.utils.typeis');

var writer = require('../../src/utils/writer.js');

describe('utils/writer.js', function () {
    it('e', function () {
        var bufferList = [];

        bufferList.push(new Buffer('\n11111111111111', 'utf8'));
        bufferList.push(new Buffer('\n22222222222222', 'utf8'));
        bufferList.push(new Buffer('\n33333333333333', 'utf8'));

        var ret = writer({
            srcDirname: __dirname,
            destDirname: __dirname,
            fileNameTemplate: '${version}.html',
            signType: 'html',
            bufferList: bufferList,
            versionList: ['1', '2', '3'],
            versionLength: 8
        });

        assert.equal(path.isFile(ret.path), true);
        assert.equal(typeis.String(ret.version), true);
    });
});


