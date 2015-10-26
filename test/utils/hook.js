/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-26 14:35
 */


'use strict';

var assert = require('assert');
var typeis = require('ydr-utils').typeis;

var hook = require('../../utils/hook.js');

describe('utils/hook.js', function () {
    it('bind', function () {
        var ret = hook.bind('test');

        assert.equal(typeis(ret), 'function');
        assert.equal(ret.length, 1);

        ret(function () {
            return '1';
        });

        ret(function () {
            return false;
        });

        ret(function () {
            //
        });
    });

    it('exec', function () {
        var ret = hook.exec('test');

        assert.equal(ret, '1');
    });
});


