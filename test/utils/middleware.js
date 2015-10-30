/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-30 15:52
 */


'use strict';

var assert = require('assert');

var Middleware = require('../../utils/middleware.js');

describe('utils/middleware.js', function () {
    it('e', function () {
        var md = new Middleware();

        md.use(function (file, options, next) {
            options.code += '2';
            next();
        });

        md.use(function (file, options, next) {
            options.code += '3';
            next();
        });

        md.exec(__filename, {
            code: '1'
        }, function () {
            console.log(arguments);
        });
    });
});



