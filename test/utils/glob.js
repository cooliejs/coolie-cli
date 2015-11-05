/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-27 11:07
 */


'use strict';

var path = require('ydr-utils').path;
var fs = require('fs');
var assert = require('assert');
var typeis = require('ydr-utils').typeis;
var dato = require('ydr-utils').dato;

var glob = require('../../utils/glob.js');


describe('utils/glob.js', function () {
    it('e', function () {
        var map = {};
        var files = glob({
            glob: '*',
            srcDirname: __dirname,
            progress: function (indexGlob, indexFile, file) {
                map[file] = indexGlob;
            }
        });

        dato.each(files, function (index, file) {
            assert.equal(typeis.file(file), true);
        });

        assert.equal(map[files[0]], '0');
    });
});

