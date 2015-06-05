/*!
 * all.js
 * @author ydr.me
 * @create 2014-09-25 19:19
 */


define(function (require) {
    /**
     * @module libs/all
     */
    'use strict';

    console.log('libs/all.js');
    require('./some.html', 'html');
    require('some.css', 'css');
    require('some.txt', 'text');
    require('some.json', 'json');
});