/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-23 15:24
 */


'use strict';

var path = require('path');
var assert = require('assert');

var replaceAMDRequire = require('../../replace/amd-require.js');

var file = __filename;

describe('replace/amd-require.js', function () {
    it('async:false', function () {
        var code = 'define(function(s,e,i){s("../libs/all.js");console.log("app/index.js")});';
        var ret = replaceAMDRequire(file, {
            code: code,
            depName2IdMap: {
                '../libs/all.js': 'n'
            }
        });
        var expect = 'define(function(s,e,i){s("n");console.log("app/index.js")});';

        assert(ret, expect);
    });
    it('async:true', function () {
        var code = 'define(function(s,e,i){s.async("../libs/all.js");console.log("app/index.js")});';
        var ret =  replaceAMDRequire(file, {
            code: code,
            async: true,
            depName2IdMap: {
                '../libs/all.js': 'n'
            }
        });
        var expect = 'define(function(s,e,i){s.async("n");console.log("app/index.js")});';

        assert(ret, expect);
    });
});

