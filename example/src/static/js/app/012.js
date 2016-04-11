/**
 * 文件描述
 * @author ydr.me
 * @create 2016-03-30 20:19
 */


define(function (require, exports, module) {
    /**
     * @module parent/012
     */

    'use strict';

    if (DEBUG) {
        console.log('DEBUG is true')
    }

    if (!DEBUG) {
        console.log('DEBUG is false');
    }

    if (CLASSICAL) {
        console.log('CLASSICAL is true');
    }

    if (!CLASSICAL) {
        console.log('CLASSICAL is false');
    }

    var abc = true;

    if (abc === true) {
        console.log('abc is true');
    }
});