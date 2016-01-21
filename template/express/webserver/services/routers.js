/**
 * 路由
 * @author ydr.me
 * @create 2015-04-29 14:32
 */


'use strict';

var express = require('express');
var log = require('ydr-utils').log;

var configs = require('../../configs.js');
var midParser = require('../middlewares/parser.js');
var midSafe = require('../middlewares/safe.js');
var midURL = require('../middlewares/url.js');
var midAPI = require('../middlewares/api.js');
var midError = require('../middlewares/error.js');


module.exports = function (next, app) {
    // 静态文件
    app.use('/', require('../controllers/static.js'));


    // 前置
    app.use(midParser.parseCookie);
    app.use(midParser.parseSession);
    app.use(midParser.parsePostBodyOfJSON);
    app.use(midParser.parsePostBodyOfURLencoded);
    app.use(midParser.parseUA);
    app.use(midSafe.mustHasHeaderHost);
    app.use(midSafe.addUACompatibleHeader);
    app.use(midSafe.addFrameOptionsHeader);
    app.use(midURL.strictRouting);
    app.use(midAPI.resAPI);
    app.use(log.__expressStart());


    // 页面
    app.use('/', require('../controllers/home.js'));


    // 接口
    app.use('/api/', require('../controllers/api.js'));


    // 后置
    app.use(log.__expressEnd());
    app.use(midError.clientError);
    app.use(midError.serverError);


    // 监听端口
    app.listen(configs.port, function (err) {
        next(err, app);
    }).on('error', next);
};


