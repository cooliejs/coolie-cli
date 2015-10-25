/**
 * 替换 css 资源
 * @author ydr.me
 * @create 2015-10-22 16:01
 */


'use strict';

var path = require('path');
var fs = require('fs');
var typeis = require('ydr-utils').typeis;
var assert = require('assert');

var replaceCSSResource = require('../../replace/css-resource.js');
var file = path.join(__dirname, '../../example/src/static/css/1.css');

var code = fs.readFileSync(file, 'utf8');
var srcDirname = path.join(__dirname, '../../example/src/');
var destDirname = path.join(__dirname, '../../example/dest/');
var destResourceDirname = path.join(destDirname, 'res');


describe('replace/css-resource.js', function () {
    it('e', function () {
        var ret = replaceCSSResource(file, {
            versionLength: 16,
            srcDirname: srcDirname,
            destDirname: destDirname,
            destResourceDirname: destResourceDirname,
            destHost: '/',
            code: code,
            returnObject: true
        });

        ret.deps.forEach(function (file) {
            assert.equal(typeis.file(file), true);
        });
    });
});


