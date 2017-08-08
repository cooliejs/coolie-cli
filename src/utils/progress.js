/**
 * 进度
 * @author ydr.me
 * @create 2016-04-07 12:02
 */


'use strict';

var fun = require('blear.utils.function');
var debug = require('blear.node.debug');
var console = require('blear.node.console');


/**
 * 显示进度
 * @type {Function}
 */
exports.run = fun.throttle(function (key, val) {
    debug.wait(key, val, {
        colors: 'yellow'
    });
}, 10);


/**
 * 停止进度
 * @param key
 * @param val
 */
exports.stop = function (key, val) {
    debug.waitEnd(key, val, {
        colors: 'green'
    });
};


