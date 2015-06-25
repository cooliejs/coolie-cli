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

    console.log('libs1/all.js');
    //require('./some.html', 'html');
    //require('some.css', 'css');
    require('../libs2/some.txt', 'text');
    require('../libs2/some.json', 'json');
    require('../libs2/some.js', 'js');
});