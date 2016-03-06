/**
 * 文件描述
 * @author ydr.me
 * @create 2016-03-06 11:42
 */


'use strict';

var gitRepo = require('../../utils/git-repo.js');

describe('utils/git-repo.js', function () {
    it('e', function (done) {
        gitRepo('coolie-demo1', function (err, json) {
            console.log(json.homepage);
            console.log(json.html_url);
            done();
        });
    });
});
