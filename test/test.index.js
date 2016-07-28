/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-12 23:42
 */


'use strict';

var url = require('blear.utils.url');
var path = require('blear.utils.path');
var access = require('blear.utils.access');

var reProtocol = /^([a-z\d_-]+:)?\/\//i;

/**
 * 处理路径
 * @param from {String} 起始路径
 * @param to {String} 目标路径
 * @returns {String}
 */
var resolve = function (from, to) {
    if (reProtocol.test(to)) {
        return to;
    }

    var protocol = '';

    from = from.replace(reProtocol, function (_protocol) {
        protocol = _protocol;
        return '';
    });

    from = path.join(from, to);

    return protocol + from;
};

var join = function (from, to/*arguments*/) {
    var args = access.args(arguments);
    var current = 1;
    var end = args.length;
    var ret = args[0];

    while (current < end) {
        ret = resolve(ret, args[current]);
        current++;
    }

    return ret;
};

describe('index.js', function () {
    it('e', function () {
        console.log(join('/', 'static/res/abc.png'));
        console.log(path.join('/', 'static/res/abc.png'));
    });
});


