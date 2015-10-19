/**
 * 挂载（外挂）
 * @author ydr.me
 * @create 2015-10-19 14:18
 */


'use strict';

var dato = require('ydr-utils').dato;
var typeis = require('ydr-utils').typeis;

var callbacks = {};


/**
 * 注册挂载
 * @param type
 * @returns {Function}
 */
exports.bind = function (type) {
    return function (callback) {
        callbacks[type] = callbacks[type] || [];

        if (typeis.function(callback)) {
            callbacks[type].push(callback);
        }
    };
};


/**
 * 执行挂载
 * @param type
 * @param args
 * @returns {undefined}
 */
exports.exec = function (type, args) {
    var coolie = global.coolie;
    var list = callbacks[type];
    var ret = undefined;

    list = list || [];
    dato.each(list, function (index, callback) {
        var _ret = callback.apply(coolie, args);

        // 如果返回 false，则终端
        if (_ret === false) {
            ret = _ret;
            return ret;
        }

        if (typeis.undefined(_ret)) {
            return;
        }

        ret = _ret;
        return false;
    });

    return ret;
};

