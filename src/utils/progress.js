/**
 * 进度
 * @author ydr.me
 * @create 2016-04-07 12:02
 */


'use strict';

var controller = require('ydr-utils').controller;
var debug = require('blear.node.debug');


/**
 * 显示进度
 * @type {Function}
 */
exports.run = controller.throttle(function (key, val) {
    debug.wait(key, val, {
        colors: 'yellow'
    });
});


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


