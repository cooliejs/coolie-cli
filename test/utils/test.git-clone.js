/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-22 09:46
 */


'use strict';

var assert = require('assert');

var gitClone = require('../../src/utils/git-clone.js');

var lazy  = function (done) {
    return function () {
        setTimeout(done, 500);
    };
};

describe('utils/git-clone.js', function () {
    it('e', function (done) {
        gitClone({
            dirname: __dirname,
            registry: 'cooliejs',
            repository: 'coolie-demo1',
            branch: 'master'
        }, lazy(done));
    });
});



