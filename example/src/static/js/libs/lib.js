/*!
 * lib.js
 * @author ydr.me
 * @create 2014-09-25 19:19
 */


define(function (require) {
    /**
     * @module libs/lib
     */
    'use strict';

    var $ = require('./jquery.js');

    $('body').css({
        background: '#eee'
    });

    require('./all.js');
    console.log('libs/lib.js');
});