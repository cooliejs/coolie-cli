/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-27 10:38
 */


'use strict';

var assert = require('assert');
var path = require('ydr-utils').path;

var parseChunk = require('../../parse/chunk.js');

var srcDirname = path.join(__dirname, '../../example/src/');

describe('parse/chunk.js', function () {
    it('e', function () {
        var ret = parseChunk({
            srcDirname: srcDirname,
            chunk: [
                [
                    './static/js/libs1/**'
                ],
                './static/js/libs2/**'
            ]
        });

        var file0 = path.join(srcDirname, 'static/js/libs1/all.js');
        var file1 = path.join(srcDirname, 'static/js/libs2/some.css');

        console.log(ret);

        assert.equal(ret[file0], '0');
        assert.equal(ret[file1], '1');
    });
});

