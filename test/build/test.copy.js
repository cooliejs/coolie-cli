/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-28 16:06
 */


'use strict';

var assert = require('assert');
var path = require('blear.node.path');

var copy = require('../../src/build/copy.js');

var srcDirname = path.join(__dirname, 'src');
var destDirname = path.join(__dirname, 'dest');

describe('build/copy.js', function () {
    it('e', function () {
        var list = copy({
            srcDirname: srcDirname,
            destDirname: destDirname,
            copy: [
                '**'
            ]
        });

        assert.equal(list.length > 1, true);
    });
});

