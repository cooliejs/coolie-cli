/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-27 11:43
 */


'use strict';

var assert = require('assert');

var stringify = require('../../src/utils/stringify.js');

describe('utils/stringify', function () {
    it('stringify', function () {
        var ret = stringify('\'"');

        assert.equal(ret, '"\'\\""');
        console.log(ret);
    });
});

