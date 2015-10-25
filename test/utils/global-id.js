/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-23 15:11
 */


'use strict';

var path = require('path');
var assert = require('assert');

var globalId = require('../../utils/global-id.js');

var file1 = 'abc';
var file2 = 'def';

describe('utils/global-id.js', function () {
    it('increase id', function () {
        var gid1 = globalId.get(file1);
        var gid2 = globalId.get(file2);
        var gid3 = globalId.get(file1);

        assert.equal(gid1, '1');
        assert.equal(gid2, '2');
        assert.equal(gid3, '1');
    });
});

