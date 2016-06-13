/**
 * 文件描述
 * @author ydr.me
 * @create 2016-05-27 22:33
 */


'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');

var srcDirname = path.join(__dirname, './src/');
var cmd2cjs = require('../../src/replace/cmd2cjs.js');

var file = path.join(srcDirname, 'cmd2cjs.js');


describe('replace/cmd2cjs.js', function () {
    it('main', function () {
        var ret = cmd2cjs(file, {
            code: fs.readFileSync(file, 'utf8')
        });

        assert.equal(ret, '/**/\n' +
            "    return '正式代码';\n" +
            '/**/');
    });
});


