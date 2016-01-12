/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-12 23:42
 */


'use strict';

var path = require('ydr-utils').path;

var index = require('../index.js');

var srcDirname= path.join(__dirname, '../example/src');

describe('index.js', function () {
    it('e', function () {
        var ret = index({
            srcDirname: srcDirname
        });

        console.log(ret);
    });
});


