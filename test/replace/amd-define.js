/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-23 15:24
 */


'use strict';

var path = require('path');
var assert = require('assert');

var replaceAMDDefine = require('../../replace/amd-define.js');
var globalId = require('../../utils/global-id.js');

describe('replace/amd-define.js', function () {
    it('amd-define', function () {
        var file1 = __filename;
        var file2 = path.join(__dirname, './amd-require.js');
        var code = 'define(function(){});';
        var depGidList = ['n'];

        // 预先注入几个文件
        globalId.get(file1);
        globalId.get(file2);

        var ret = replaceAMDDefine(file1, {
            code: code,
            gid: '0',
            depGidList: depGidList
        });
        var reg = /define\("[a-z\d]+",\["[a-z\d]+"],function\(\)\{}\);/;

        assert.equal(reg.test(ret), true);
    });
});



