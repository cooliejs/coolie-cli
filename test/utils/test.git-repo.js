/**
 * 文件描述
 * @author ydr.me
 * @create 2016-03-06 11:42
 */


'use strict';

var gitRepo = require('../../src/utils/git-repo.js');

describe('utils/git-repo.js', function () {
    it('e', function (done) {
        gitRepo('coolie-demo1', function (err, json) {
            if (err) {
                console.log(err);
                done();
                return;
            }

            console.log(json);
            done();
        });
    });
});
