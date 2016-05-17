/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-25 11:39
 */


'use strict';

var path = require('ydr-utils').path;
var assert = require('assert');
var fs = require('fs');
var dato = require('ydr-utils').dato;

var replaceModuleWrapper = require('../../replace/module-wrapper.js');
var globalId = require('../../utils/global-id.js');

var srcDirname = path.join(__dirname, 'src/');
var destDirname = path.join(__dirname, 'dest/');
var destResourceDirname = path.join(destDirname, 'static/res/');
var destCSSDirname = path.join(destDirname, 'static/css/');
var destJSDirname = path.join(destDirname, 'static/js/');

var jsonPath = path.join(srcDirname, 'module-wrapper.json');
var cssPath = path.join(srcDirname, 'module-wrapper.css');
var textPath = path.join(srcDirname, 'module-wrapper.txt');
var htmlPath = path.join(srcDirname, 'module-wrapper.html');
var imagePath = path.join(srcDirname, 'module-wrapper.jpg');
var jsPath = path.join(srcDirname, 'module-wrapper.js');

var options = {
    srcDirname: srcDirname,
    destDirname: destDirname,
    destResourceDirname: destResourceDirname,
    destCSSDirname: destCSSDirname,
    destJSDirname: destJSDirname,
    destHost: '/',
    versionLength: 32
};

globalId.get(jsonPath, 'js');
globalId.get(cssPath, 'js');
globalId.get(textPath, 'js');
globalId.get(htmlPath, 'js');
globalId.get(imagePath, 'js');
globalId.get(jsPath, 'js');

describe('module-wrapper', function () {
    describe('json', function () {
        var options2 = dato.extend({}, options);
        var file = jsonPath;

        options2.code = fs.readFileSync(file, 'utf8');
        options2.inType = 'json';
        it('=>url', function () {
            var options3 = dato.extend({}, options2);
            options3.outType = 'url';
            var replaceModuleWrapperRet = replaceModuleWrapper(file, options3);
            console.log(replaceModuleWrapperRet);
            assert.equal(/\/static\/res\//.test(replaceModuleWrapperRet.code), true);
        });
        it('=>base64', function () {
            var options3 = dato.extend({}, options2);
            options3.outType = 'base64';
            var replaceModuleWrapperRet = replaceModuleWrapper(file, options3);
            console.log(replaceModuleWrapperRet);
            assert.equal(/"data:application\/json;base64,/.test(replaceModuleWrapperRet.code), true);
        });
        it('=>js', function () {
            var options3 = dato.extend({}, options2);
            options3.outType = 'js';
            var replaceModuleWrapperRet = replaceModuleWrapper(file, options3);
            console.log(replaceModuleWrapperRet);
            assert.equal(replaceModuleWrapperRet.code.indexOf('return {') > -1, true);
        });
    });

    describe('css', function () {
        var options2 = dato.extend({}, options);
        var file = cssPath;

        options2.inType = 'css';
        options2.code = fs.readFileSync(file, 'utf8');
        it('=>url', function () {
            var options3 = dato.extend({}, options2);
            options3.outType = 'url';
            var replaceModuleWrapperRet = replaceModuleWrapper(cssPath, options3);
            console.log(replaceModuleWrapperRet);
            assert.equal(/\/static\/css\//.test(replaceModuleWrapperRet.code), true);
        });
        it('=>base64', function () {
            var options3 = dato.extend({}, options2);
            options3.outType = 'base64';
            var replaceModuleWrapperRet = replaceModuleWrapper(file, options3);
            console.log(replaceModuleWrapperRet);
            assert.equal(/data:text\/css;base64,/.test(replaceModuleWrapperRet.code), true);
        });
        it('=>js', function () {
            var options3 = dato.extend({}, options2);
            options3.outType = 'js';
            var replaceModuleWrapperRet = replaceModuleWrapper(file, options3);
            console.log(replaceModuleWrapperRet);
            assert.equal(replaceModuleWrapperRet.code.indexOf('return "') > -1, true);
        });
    });
    //
    describe('text', function () {
        var options2 = dato.extend({}, options);
        var file = textPath;

        options2.inType = 'text';
        options2.code = fs.readFileSync(file, 'utf8');
        it('=>url', function () {
            var options3 = dato.extend({}, options2);
            options3.outType = 'url';
            var replaceModuleWrapperRet = replaceModuleWrapper(file, options3);
            console.log(replaceModuleWrapperRet);
            assert.equal(/\/static\/res\//.test(replaceModuleWrapperRet.code), true);
        });
        it('=>base64', function () {
            var options3 = dato.extend({}, options2);
            options3.outType = 'base64';
            var replaceModuleWrapperRet = replaceModuleWrapper(file, options3);
            console.log(replaceModuleWrapperRet);
            assert.equal(/data:text\/plain;base64,/.test(replaceModuleWrapperRet.code), true);
        });
        it('=>js', function () {
            var options3 = dato.extend({}, options2);
            options3.outType = 'js';
            var replaceModuleWrapperRet = replaceModuleWrapper(file, options3);
            console.log(replaceModuleWrapperRet);
            assert.equal(replaceModuleWrapperRet.code.indexOf('return "') > -1, true);
        });
    });

    describe('html', function () {
        var options2 = dato.extend({}, options);
        var file = htmlPath;

        options2.inType = 'html';
        options2.code = fs.readFileSync(file, 'utf8');
        it('=>url', function () {
            var options3 = dato.extend({}, options2);
            options3.outType = 'url';
            var replaceModuleWrapperRet = replaceModuleWrapper(file, options3);
            console.log(replaceModuleWrapperRet);
            assert.equal(/\/static\/res\//.test(replaceModuleWrapperRet.code), true);
        });
        it('=>base64', function () {
            var options3 = dato.extend({}, options2);
            options3.outType = 'base64';
            var replaceModuleWrapperRet = replaceModuleWrapper(file, options3);
            console.log(replaceModuleWrapperRet);
            assert.equal(/data:text\/html;base64,/.test(replaceModuleWrapperRet.code), true);
        });
        it('=>js', function () {
            var options3 = dato.extend({}, options2);
            options3.outType = 'js';
            var replaceModuleWrapperRet = replaceModuleWrapper(file, options3);
            console.log(replaceModuleWrapperRet);
            assert.equal(replaceModuleWrapperRet.code.indexOf('return "') > -1, true);
        });
    });

    describe('image', function () {
        var options2 = dato.extend({}, options);
        var file = imagePath;

        options2.inType = 'image';
        it('=>url', function () {
            var options3 = dato.extend({}, options2);
            options3.outType = 'url';
            var replaceModuleWrapperRet = replaceModuleWrapper(file, options3);
            console.log(replaceModuleWrapperRet);
            assert.equal(/\/static\/res\//.test(replaceModuleWrapperRet.code), true);
        });
        it('=>base64', function () {
            var options3 = dato.extend({}, options2);
            options3.outType = 'base64';
            var replaceModuleWrapperRet = replaceModuleWrapper(file, options3);
            console.log(replaceModuleWrapperRet);
            assert.equal(/data:image\/jpeg;base64,/.test(replaceModuleWrapperRet.code), true);
        });
        it('=>js', function () {
            var options3 = dato.extend({}, options2);
            options3.outType = 'js';
            var replaceModuleWrapperRet = replaceModuleWrapper(file, options3);
            console.log(replaceModuleWrapperRet);
            assert.equal(replaceModuleWrapperRet.code.indexOf('return "') > -1, true);
        });
    });
});


