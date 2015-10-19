/**
 * 挂载
 * @author ydr.me
 * @create 2015-10-19 14:18
 */


'use strict';

var dato = require('ydr-utils').dato;
var typeis = require('ydr-utils').typeis;

exports.exec = function (type, args) {
    var coolie = global.coolie;
    var configs = global.configs;
    var list = configs['_' + type + 'Callbacks'];
    var ret = undefined;

    list = list || [];
    dato.each(list, function (index, callback) {
        var _ret = callback.apply(coolie, args);

        if (_ret === false) {
            return _ret;
        }

        if (typeis.undefined(_ret)) {
            return;
        }

        ret = _ret;
        return false;
    });

    return ret;
};

