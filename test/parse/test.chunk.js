/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-27 10:38
 */


'use strict';

var assert = require('assert');
var path = require('ydr-utils').path;

var parseChunk = require('../../parse/chunk.js');

var srcDirname = path.join(__dirname, 'src/');

describe('parse/chunk.js', function () {
    it('e', function () {
        var ret = parseChunk({
            srcDirname: srcDirname,
            chunk: [
                [
                    'a/**'
                ],
                'b/**'
            ]
        });

        var file0 = path.join(srcDirname, 'a/1.js');
        var file1 = path.join(srcDirname, 'b/2.js');

        console.log(ret);

        assert.equal(ret[file0], '0');
        assert.equal(ret[file1], '1');
    });
});

