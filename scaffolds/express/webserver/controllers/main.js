/**
 * 主控制器
 * @author ydr.me
 * @create 2016-01-13 14:45
 */


'use strict';

var Router = require('express').Router;

var configs = require('../../configs');
var pkg = require('../../package.json');

var router = new Router();

// 首页
router.get('/', function (req, res, next) {
    res.render('index.html', {
        pkg: pkg
    });
});

module.exports = router;
