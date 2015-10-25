/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-25 11:39
 */


'use strict';

var path = require('path');
var assert = require('assert');

var replaceModuleWrapper = require('../../replace/module-wrapper.js');
var globalId = require('../../utils/global-id.js');

var file = __filename;
var srcDirname = path.join(__dirname, '../../example/src/');
var destDirname = path.join(__dirname, '../../example/dest/');
var destResourceDirname = path.join(destDirname, 'res');
var destCSSDirname = path.join(destDirname, 'static/css/');
var destJSDirname = path.join(destDirname, 'static/js/');

var options = {
    srcDirname: srcDirname,
    destDirname: destDirname,
    destResourceDirname: destResourceDirname,
    destCSSDirname: destCSSDirname,
    destJSDirname: destJSDirname,
    destHost: '/',
    versionLength: 32
};

globalId.get(file);

describe('module-wrapper', function () {
    it('json=>url', function () {
        options.code = JSON.stringify({
            a: 1,
            b: 2
        });
        options.inType = 'json';
        options.outType = 'url';
        var code = replaceModuleWrapper(file, options);
        assert.equal(/\/static\/css\//.test(code), true);
    });
    it('json=>js', function () {
        options.code = JSON.stringify({
            a: 1,
            b: 2
        });
        options.inType = 'json';
        options.outType = 'js';
        var code = replaceModuleWrapper(file, options);
        //var expected = 'define("1",[],function(y,d,r){r.exports={"a":1,"b":2}});';
        assert.equal(code.indexOf('r.exports={\"a\":1,\"b\":2}') > -1, true);
    });
});


