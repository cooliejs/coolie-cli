/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-23 15:24
 */


'use strict';

var fs = require('fs');
var path = require('ydr-utils').path;
var assert = require('assert');

var replaceRequire = require('../../src/replace/require.js');

var file = path.join(__dirname, './src/require.js');


describe('replace/require.js', function () {
    it('async:false', function () {
        var ret = replaceRequire(file, {
            code: fs.readFileSync(file, 'utf8'),
            async: false,
            outName2IdMap: {
                './core|js': 'x',
                './mouse|js': 'y',
                './widget|js': 'z'
            }
        });

        console.log(ret);
    });

    it('async:true', function () {
        var code = 'define(function(require){require("../libs/x.js");require.async("../libs/all.js");console.log("app/index.js")});';
        var ret =  replaceRequire(file, {
            code: code,
            async: true,
            outName2IdMap: {
                '../libs/all.js|js': 'n'
            }
        });
        var expect = 'define(function(require){require("../libs/x.js");require.async("n");console.log("app/index.js")});';

        console.log(ret);
        assert.equal(ret, expect);
    });
});

