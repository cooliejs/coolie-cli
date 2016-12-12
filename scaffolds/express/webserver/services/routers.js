/**
 * 路由
 * @author ydr.me
 * @create 2015-04-29 14:32
 */


'use strict';

var express = require('express');
var log = require('blear.node.log');
var expressResAPI = require('blear.express.res-api');

var configs = require('../../configs.js');
var midParser = require('../middlewares/parser.js');
var midSafe = require('../middlewares/safe.js');
var midError = require('../middlewares/error.js');
var midLocals = require('../middlewares/locals.js');


module.exports = function (next, app, redis) {
    // res.api
    app.use(expressResAPI(app, {
        rewriteError: false
    }));


    // 静态文件
    app.use('/', require('../controllers/static.js'));
    app.use('/', require('../controllers/public.js'));


    // 前置
    app.use(midParser.parseCookie());
    app.use(midParser.parseSession(redis));
    app.use(midParser.parseFullURL());
    app.use(midParser.parseIP());
    app.use(midParser.parseAccess());
    app.use(midParser.parseApplicationJSON());
    app.use(midParser.parseApplicationXwwwFormUrlencoded());
    app.use(midParser.parseRedis(redis));
    app.use(midSafe.requestHeadersSafe());
    app.use(midSafe.addUACompatibleHeader());
    app.use(midSafe.addFrameOptionsHeader());
    app.use(midLocals.$configs());
    app.use(midLocals.$url());
    app.use(midLocals.$ua());



    // 页面
    app.use('/', require('../controllers/main.js'));


    // 接口
    app.use('/api/example/', require('../controllers/api/example.js'));


    // 后置
    app.use(log.expressMiddleware());
    app.use(midError.clientError);
    app.use(midError.serverError);


    // 监听端口
    app.listen(configs.port, function (err) {
        next(err, app);
    }).on('error', next);
};


