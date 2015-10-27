/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-27 11:21
 */


'use strict';

var assert = require('assert');
var path = require('path');

var parseMain = require('../../parse/main.js');

var srcDirname = path.join(__dirname, '../../example/src/');

describe('parse/main.js', function () {
    it('e', function () {
        var mainMap = parseMain({
            main: [
                "./static/js/app/**"
            ],
            srcDirname: srcDirname
        });

        console.log(mainMap);
    });
});


