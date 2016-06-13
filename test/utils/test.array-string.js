/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-28 00:25
 */


'use strict';

var assert = require('assert');

var arrayString = require('../../src/utils/array-string.js');


describe('utils/array-string.js', function () {
    var ret1 = ['a', '1', 2];
    var ret2 = arrayString.stringify(ret1);
    var ret3 = arrayString.parse(ret2);

    it('stringify', function () {
        assert.equal(ret2, '["a","1","2"]');
    });

    it('parse', function () {
        assert.deepEqual(ret3, ['a', '1', '2']);
    });
});

