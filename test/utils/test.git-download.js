/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-22 09:46
 */


'use strict';

var assert = require('assert');

var gitDownload = require('../../src/utils/git-download.js');

var lazy  = function (done) {
    return function () {
        setTimeout(done, 500);
    };
};

describe('utils/git-clone.js', function () {
    it('e', function (done) {
        gitDownload({
            dirname: __dirname,
            registry: 'cooliejs',
            repository: 'coolie-demo1',
            branch: 'master'
        }, lazy(done));
    });
});



