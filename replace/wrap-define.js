/**
 * define 包装
 * @author ydr.me
 * @create 2016-05-16 16:37
 */


'use strict';

module.exports = function (id, deps, factory) {
    var depsStr = deps.join('", "');

    if (depsStr) {
        depsStr = '"' + depsStr + '"';
    }

    return 'define("' + id + '", [' + depsStr + '], function (require, exports, module) {\n\n' +
        factory +
        '\n\n});';
};


