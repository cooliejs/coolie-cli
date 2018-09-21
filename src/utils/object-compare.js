/**
 * 对象比较
 * @create 2014-09-14 17:26
 * @update 2018年09月21日11:30:37
 */

'use strict';

var typeis = require('blear.utils.typeis');
var collection = require('blear.utils.collection');


/**
 * 对象1级比较，找出相同和不同的键
 * @param obj1 {Object|Array}
 * @param obj2 {Object|Array}
 * @returns {Object}
 *
 * @example
 * data.compare({a:1,b:2,c:3}, {a:1,d:4});
 * // =>
 * // {
 * //    same: ["a"],
 * //    only: [
 * //       ["b", "c"],
 * //       ["d"]
 * //    ],
 * //    different: ["b", "c", "d"]
 * // }
 */
module.exports = function (obj1, obj2) {
    var obj1Type = typeis(obj1);
    var obj2Type = typeis(obj2);
    var obj1Only = [];
    var obj2Only = [];
    var same = [];

    // 类型不同
    if (obj1Type !== obj2Type) {
        return null;
    }

    // 对象
    if (obj1Type === 'object' || obj1Type === 'array') {
        collection.each(obj1, function (key, val) {
            if (obj2[key] !== val) {
                obj1Only.push(key);
            } else {
                same.push(key);
            }
        });

        collection.each(obj2, function (key, val) {
            if (obj1[key] !== val) {
                obj2Only.push(key);
            }
        });

        return {
            same: same,
            only: [
                obj1Only,
                obj2Only
            ],
            different: obj1Only.concat(obj2Only)
        };
    } else {
        return null;
    }
};
