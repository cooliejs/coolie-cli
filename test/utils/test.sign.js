/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-26 15:16
 */


'use strict';

var assert = require('assert');

var pkg = require('../../package.json');
var sign = require('../../src/utils/sign.js');

var banner = pkg.name + ' built';

describe('utils/sign.js', function () {
    it('html', function () {
        var ret = sign('html');
        var exp = '<!--' + banner + '-->';

        assert.equal(ret, exp);
    });
    it('css/js', function () {
        var ret1 = sign('css');
        var ret2 = sign('js');
        var exp = '/*' + banner + '*/';

        assert.equal(ret1, exp);
        assert.equal(ret2, exp);
    });
});



