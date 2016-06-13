/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-23 15:24
 */


'use strict';

var path = require('ydr-utils').path;
var assert = require('assert');

var wrapDefine = require('../../src/replace/wrap-define.js');

describe('replace/wrap-define.js', function () {
    it('deps:empty', function () {
        var factory = '"aaa";';
        var id = 0;
        var deps = [];

        console.log(wrapDefine(__filename, {
            id: id,
            deps: deps,
            factory: factory,
            srcDirname: __dirname,
            destHost: '/',
            inType: 'js'
        }));
    });
    it('deps:not empty', function () {
        var factory = '"aaa";';
        var id = 0;
        var deps = [1, 2, 3];

        console.log(wrapDefine(__filename, {
            id: id,
            deps: deps,
            factory: factory,
            srcDirname: __dirname,
            destHost: '/',
            inType: 'js'
        }));
    });
});



