/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-26 11:57
 */


'use strict';

var assert = require('assert');

var parseCMDRequire = require('../../parse/cmd-require.js');
var file = __filename;

describe('parse/cmd-require.js', function () {
    it('sync', function () {
        var code = 'define(function(){require("a.js");require("./a.js");require("a.css", "css|url")});';
        var requires = parseCMDRequire(file, {
            code: code,
            async: false
        });

        //console.log(JSON.stringify(requires, null, 4));
        assert.equal(requires.length, 3);
        assert.equal(requires[0].name, 'a.js');
        assert.equal(requires[1].name, './a.js');
        assert.equal(requires[2].name, 'a.css');
        assert.equal(requires[0].inType, 'js');
        assert.equal(requires[0].outType, 'js');
        assert.equal(requires[1].inType, 'js');
        assert.equal(requires[1].outType, 'js');
        assert.equal(requires[2].inType, 'css');
        assert.equal(requires[2].outType, 'url');
    });
    it('async', function () {
        var code = 'define(function(){require.async("a.js");require.async("./a.js");require.async("b.js", function(){alert("done")})});';
        var requires = parseCMDRequire(file, {
            code: code,
            async: true
        });

        //console.log(JSON.stringify(requires, null, 4));
        assert.equal(requires.length, 3);
        assert.equal(requires[0].name, 'a.js');
        assert.equal(requires[1].name, './a.js');
        assert.equal(requires[2].name, 'b.js');
        assert.equal(requires[0].inType, 'js');
        assert.equal(requires[0].outType, 'js');
        assert.equal(requires[1].inType, 'js');
        assert.equal(requires[1].outType, 'js');
        assert.equal(requires[2].inType, 'js');
        assert.equal(requires[2].outType, 'js');
    });
});


