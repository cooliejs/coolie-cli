/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-26 11:57
 */


'use strict';

var fs = require('fs');
var assert = require('assert');
var path = require('blear.node.path');

var parseRequireList = require('../../src/parse/require.js');

var srcDirname = path.join(__dirname, 'src');
var file = path.join(srcDirname, 'require.js');
var nodeModulesDirname = path.join(__dirname, 'node-modules');

describe('parse/require.js', function () {
    it('sync', function () {
        var requires = parseRequireList(file, {
            code: fs.readFileSync(file, 'utf8'),
            async: false,
            srcDirname: srcDirname,
            srcCoolieConfigNodeModulesDirname: nodeModulesDirname,
            coolieConfigs: {
                nodeModuleMainPath: 'app/'
            }
        });

        console.log(JSON.stringify(requires, null, 4));
        assert.equal(requires.length, 3);
    });

    it('async', function () {
        var code = 'define(function(){' +
            'require.async("a");' +
            'require.async("./a.js");' +
            'require.async("./b.js", function(){alert("done");});' +
            '});';
        var requires = parseRequireList(file, {
            code: code,
            async: true,
            srcDirname: srcDirname,
            srcCoolieConfigNodeModulesDirname: nodeModulesDirname,
            coolieConfigs: {
                nodeModuleMainPath: 'app/'
            }
        });

        console.log(JSON.stringify(requires, null, 4));
        assert.equal(requires.length, 3);
        assert.equal(requires[0].name, 'a');
        assert.equal(requires[1].name, './a.js');
        assert.equal(requires[2].name, './b.js');
        assert.equal(requires[0].inType, 'js');
        assert.equal(requires[0].outType, 'js');
        assert.equal(requires[1].inType, 'js');
        assert.equal(requires[1].outType, 'js');
        assert.equal(requires[2].inType, 'js');
        assert.equal(requires[2].outType, 'js');
    });
});


