/*!
 * JS 压缩
 * @author ydr.me
 * @create 2014-10-23 19:47
 */

'use strict';

var path = require('ydr-utils').path;
var fs = require('fs');
var assert = require('assert');

var minifyJS = require('../../minify/js.js');
var file = path.join(__dirname, '../../example/src/static/js/index3-1.js');

describe('minify/js.js', function () {
    it('e', function () {
        var code = 'function abc(){var abcdef = 1;alert(abcdef);}';
        var ret = minifyJS(file, {
            code: code
        });
        var expect = 'function abc(){var a=1;alert(a)}';

        assert.equal(ret, expect);
    });
});


