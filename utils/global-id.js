/**
 * 文件的全局递增 ID
 * @author ydr.me
 * @create 2015-10-23 15:06
 */


'use strict';

var klass = require('ydr-utils').class;


var Increase = klass.create({
    constructor: function (init10) {
        if (init10 === undefined) {
            init10 = 0;
        }

        this._init10 = init10;
        this._init36 = this._init10.toString(36);
    },

    /**
     * 递增 ID
     * @returns {Increase}
     */
    add: function () {
        this._init10++;
        this._init36 = this._init10.toString(36);

        return this;
    },

    /**
     * 获取 ID
     * @returns {string|*}
     */
    get: function () {
        return this._init36;
    }
});


var increase = new Increase();
var fileIdMap = {};


/**
 * 获得全局唯一 ID
 * @returns {String}
 */
exports.get = function (file) {
    var gid = fileIdMap[file];

    if (gid) {
        return gid;
    }

    fileIdMap[file] = gid = increase.add().get();

    return gid;
};




