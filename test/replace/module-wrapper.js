/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-25 11:39
 */


'use strict';

var path = require('path');
var assert = require('assert');
var fs = require('fs');
var dato = require('ydr-utils').dato;

var replaceModuleWrapper = require('../../replace/module-wrapper.js');
var globalId = require('../../utils/global-id.js');

var srcDirname = path.join(__dirname, '../../example/src/');
var destDirname = path.join(__dirname, '../../example/dest/');
var destResourceDirname = path.join(destDirname, 'static/res/');
var destCSSDirname = path.join(destDirname, 'static/css/');
var destJSDirname = path.join(destDirname, 'static/js/');

var jsonPath = path.join(srcDirname, 'coolie.json');
var cssPath = path.join(srcDirname, 'static/css/1.css');

var options = {
    srcDirname: srcDirname,
    destDirname: destDirname,
    destResourceDirname: destResourceDirname,
    destCSSDirname: destCSSDirname,
    destJSDirname: destJSDirname,
    destHost: '/',
    versionLength: 32
};

globalId.get(jsonPath);
globalId.get(cssPath);

describe('module-wrapper', function () {
    describe('json', function () {
        var options2 = dato.extend({}, options);
        options2.code = fs.readFileSync(jsonPath, 'utf8');
        options2.inType = 'json';
        it('=>url', function () {
            var options3 = dato.extend({}, options2);
            options3.outType = 'url';
            var code = replaceModuleWrapper(jsonPath, options3);
            //console.log(code);
            assert.equal(/\/static\/res\//.test(code), true);
        });
        it('=>base64', function () {
            var options3 = dato.extend({}, options2);
            options3.outType = 'base64';
            var code = replaceModuleWrapper(jsonPath, options3);
            //console.log(code);
            assert.equal(/"data:application\/json;base64,/.test(code), true);
        });
        it('=>js', function () {
            var options3 = dato.extend({}, options2);
            options3.outType = 'js';
            var code = replaceModuleWrapper(jsonPath, options3);
            //console.log(code);
            assert.equal(code.indexOf('r.exports={') > -1, true);
        });
    });
    describe('css', function () {
        var options2 = dato.extend({}, options);
        options2.inType = 'css';
        options2.code = fs.readFileSync(cssPath, 'utf8');
        it('=>url', function () {
            var options3 = dato.extend({}, options2);
            options3.outType = 'url';
            var code = replaceModuleWrapper(cssPath, options3);
            assert.equal(/\/static\/css\//.test(code), true);
        });
        it('=>base64', function () {
            var options3 = dato.extend({}, options2);
            options3.outType = 'base64';
            var code = replaceModuleWrapper(cssPath, options3);
            assert.equal(/data:text\/css;base64,/.test(code), true);
        });
        it('=>js', function () {
            var options3 = dato.extend({}, options2);
            options3.outType = 'js';
            var code = replaceModuleWrapper(jsonPath, options3);
            console.log(code);
            assert.equal(code.indexOf('r.exports="') > -1, true);
        });
    });
});


