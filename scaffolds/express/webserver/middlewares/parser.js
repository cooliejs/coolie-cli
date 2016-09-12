/**
 * 解析类中间件
 * @author ydr.me
 * @create 2016-01-13 15:11
 */


'use strict';

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var sessionParser = require('express-session');
var multer = require('multer');
var os = require('os');
var object = require('blear.utils.object');
var system = require('blear.node.system');
var console = require('blear.node.console');


var configs = require('../../configs.js');
var redisKey = require('../static/redis-key');


var upload = multer({
    dest: os.tmpdir()
});


// 解析 cookie
exports.parseCookie = function () {
    return cookieParser(configs.cookie.secret);
};


// 解析 session
exports.parseSession = function (redis) {
    return sessionParser({
        resave: true,
        saveUninitialized: true,
        secret: configs.cookie.secret,
        name: configs.cookie.sessionName,
        store: redis ? redis.expressSessionStorage(sessionParser, redisKey.SESSION) : null
    });
};


// 解析完整 URL
exports.parseFullURL = function () {
    return function (req, res, next) {
        req.$fullURL = req.protocol + '://' + req.headers.host + req.originalUrl;
        next();
    };
};


// 解析 IP
exports.parseIP = function () {
    return function (req, res, next) {
        if (req.session.$ip) {
            req.$ip = req.session.$ip;
            return next();
        }

        system.remoteIP(req, function (ip) {
            req.$ip = ip;
            req.session.$ip = ip;
            next();
        });
    };
};


// 解析访问信息
exports.parseAccess = function () {
    return function (req, res, next) {
        console.infoWithTime(req.$ip, req.method, req.$fullURL, req.headers);
        next();
    };
};


// 解析 application/json
exports.parseApplicationJSON = function () {
    return bodyParser.json({
        strict: true,
        limit: '1mb',
        type: 'json'
    });
};


// 解析 application/x-www-form-urlencoded
exports.parseApplicationXwwwFormUrlencoded = function () {
    return bodyParser.urlencoded({
        extended: false
    });
};


// 解析 multipart/form-data text
exports.parseMultipartFormData = upload.array();


// 附加 req.redis res.redis
exports.parseRedis = function (redis) {
    return function (req, res, next) {
        if (redis) {
            req.redis = res.redis = redis;
        }

        next();
    };
};



