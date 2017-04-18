/**
 * 示例
 * @author ydr.me
 * @create 2016-05-27 17:25
 */


'use strict';

var Router = require('express').Router;

var router = new Router();

// 获取 xxxx
router.get('/', function (req, res, next) {
    res.api(Math.random());
});


module.exports = router;
