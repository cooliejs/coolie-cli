/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-27 21:08
 */


'use strict';


var fse = require('fs-extra');
var path = require('path');
var assert = require('assert');

var parseDefineRequireVarible = require('../../parse/define-require-varible.js');


describe('parse/define-require-varible.js', function () {
    it('e1', function () {
        var code = 'define(function(r,e,q){});';
        var ret = parseDefineRequireVarible(__filename, {
            code: code
        });

        assert.equal(ret, 'r');
    });
    
    it('e2', function () {
        var code = 'define(function(){});';
        var ret = parseDefineRequireVarible(__filename, {
            code: code
        });

        assert.equal(ret, '');
    });

    it('e3', function () {
        var code = fse.readFileSync(path.join(__dirname, '1.txt'), 'utf8');
        var ret = parseDefineRequireVarible(__filename, {
            code: code
        });

        assert.equal(ret, 'require');
    });
});

