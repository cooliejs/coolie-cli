/**
 * home 控制器
 * @author ydr.me
 * @create 2016-01-13 14:45
 */


'use strict';

var Router = require('express').Router;

var app = new Router();

app.get('/', function (req, res, next) {
    res.render('home.html');
});

module.exports = app;
