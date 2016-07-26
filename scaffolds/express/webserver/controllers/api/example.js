/**
 * 活动相关
 * @author ydr.me
 * @create 2016-05-27 17:25
 */


'use strict';

var Router = require('express').Router;


var api = require('../../utils/api');


var router = new Router();


// 活动详情
router.get('/', function (req, res, next) {
    res.api(Math.random());
});


module.exports = router;
