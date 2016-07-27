/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-12 23:42
 */


'use strict';

var url = require('blear.utils.url');



describe('index.js', function () {
    it('e', function () {
        console.log(url.join('/', 'static/res/abc.png'));
    });
});


