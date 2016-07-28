/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-12 23:42
 */


'use strict';

var url = require('blear.utils.url');
var path = require('blear.utils.path');
var access = require('blear.utils.access');

var RESOLVE = 'resolve';
var JOIN = 'join';


/**
 * 处理路径
 * @param from {String} 起始路径
 * @param to {String} 目标路径
 * @param method {String} 方法
 * @returns {String}
 */
var add = function (from, to, method) {
    var fromRet = url.parse(from);
    var toRet = url.parse(to);

    console.log('fromRet', fromRet);
    console.log('toRet', toRet);

    if (toRet.host || toRet.protocol) {
        return to;
    }

    toRet.protocol = fromRet.protocol;
    toRet.host = fromRet.host;

    if (method === RESOLVE) {
        fromRet.pathname = path.dirname(fromRet.pathname);
    }

    toRet.pathname = path[method](fromRet.pathname, toRet.pathname);

    return url.stringify(toRet);
};


var buildExports = function (method) {
    /**
     * 合并、解决路径
     * @param from {String} 起始路径
     * @param to {String} 目标路径
     * @returns {String}
     */
    return function (from, to/*arguments*/) {
        var args = access.args(arguments);
        var current = 1;
        var end = args.length;
        var ret = args[0];

        while (current < end) {
            ret = add(ret, args[current], method);
            current++;
        }

        return ret;
    };
};


var join = buildExports(JOIN);


describe('index.js', function () {
    it('e', function () {
        console.log(url.parse('static/res/abc.png'));
        console.log(url.join('/','static/res/abc.png'));
    });
});


