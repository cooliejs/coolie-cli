/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-22 09:46
 */


'use strict';

var path = require('path');
var assert = require('assert');

var base64 = require('../../utils/base64.js');

var base64File = path.join(__dirname, './base64.js');

describe('utils/base64.js', function () {
    it('base64.string', function () {
        var ret1 = base64.string('1');
        var ret2 = base64.string('1', '.txt');

        assert.equal(ret1, 'MQ==');
        assert.equal(ret2, 'data:text/plain;base64,MQ==');
    });

    it('base64.file', function () {
        var ret1 = base64.file(base64File);
        var ret2 = base64.file(base64File, '.css');

        assert.equal(/data:text\/javascript;base64,/.test(ret1), true);
        assert.equal(/data:text\/css;base64,/.test(ret2), true);
    });
});



