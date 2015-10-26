/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-26 14:28
 */


'use strict';

var assert = require('assert');
var path = require('path');
var typeis = require('ydr-utils').typeis;

var guessDirname = require('../../utils/guess-dirname.js');

describe('utils/guess-dirname.js', function () {
    it('exist', function () {
        var dirname = path.join(__dirname, '../');
        var ret = guessDirname(dirname, 'utils');

        assert.equal(typeis.directory(ret), false);
    });

    it('!exist', function () {
        var beginDirname = path.join(__dirname, '../');
        var dirname = '__some__';
        var expect = path.join(beginDirname, dirname);
        var ret = guessDirname(beginDirname, dirname);

        assert.equal(typeis.directory(ret), false);
        assert.equal(path.relative(ret, expect), '');
    });
});

