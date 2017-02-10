/**
 * 文件描述
 * @author ydr.me
 * @create 2016-05-16 15:24
 */

define(function (require, exports, module) {


    'use strict';

    var hehe = require('../utils/hehe');
    var hehe2 = require('../utils/hehe', 'js');
    var hehe3 = require('../utils/hehe', 'js|js');
    require('../data/data.css');

    require('../data/json.json', 'json');

    require.async('../async/page1.js', function (page1) {
        alert(page1);
    });

    alert('正确');
});
