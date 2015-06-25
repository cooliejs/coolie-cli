/*!
 * 自增方法 0-z
 * @author ydr.me
 * @create 2014-10-23 20:20
 */

'use strict';



var Increase = function (init10) {
    if(init10 === undefined){
        init10 = 0;
    }

    this._init10 = init10;
    this._init36 = this._init10.toString(36);
};


/**
 * 数值加1
 * @returns {*|string|String}
 */
Increase.prototype.add = function () {
    this._init10++;
    this._init36 = this._init10.toString(36);

    return this._init36;
};


/**
 * 获取当前值
 * @returns {*|string|String}
 */
Increase.prototype.get = function () {
    return this._init36;
};


module.exports = Increase;

