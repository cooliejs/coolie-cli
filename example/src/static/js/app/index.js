/*!
 * index.js
 * @author ydr.me
 * @create 2014-09-25 19:19
 */


define(function (require, exports, module) {
    /**
     * @module app/index
     */
    'use strict';

    require('../libs/lib.js');
    require('../libs/all.js');
    var txt = require('text!../libs/some.txt');
    var style = require('text!../libs/style.css');

    console.log('app/index.js');
    console.log(txt);
    console.log(style);
});