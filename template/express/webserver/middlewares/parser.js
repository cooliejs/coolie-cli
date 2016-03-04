/**
 * 解析类中间件
 * @author ydr.me
 * @create 2016-01-13 15:11
 */


'use strict';

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var sessionParser = require('express-session');
var random = require('ydr-utils').random;
var encryption = require('ydr-utils').encryption;
var multer = require('multer');
var os = require('os');

var configs = require('../../configs.js');

var upload = multer({
    dest: os.tmpdir()
});


// 解析 cookie
exports.parseCookie = cookieParser(configs.cookie.secret);


// 解析 session
exports.parseSession = function (store) {
    return sessionParser({
        genid: function () {
            return random.string() + encryption.md5(random.guid());
        },
        resave: true,
        saveUninitialized: true,
        secret: configs.cookie.secret,
        store: store
    });
};


// 解析 application/json
exports.parseApplicationJSON = bodyParser.json({
    strict: true,
    limit: '100kb',
    type: 'json'
});


// 解析 application/x-www-form-urlencoded
exports.parseApplicationXwwwFormUrlencoded = bodyParser.urlencoded({
    extended: false
});


// 解析 multipart/form-data text
exports.parseMultipartFormData = upload.array();


// 解析 ua
exports.parseUA = function (req, res, next) {
    var ua = req.headers['user-agent'];
    var isMobile = /mobile|iphone|ipad|ipod|andorid/i.test(ua);
    var isWeixin = /MicroMessenger\b/i.test(ua);
    var isDangkr = /dangkr\b/.test(ua);
    var isIOS = /iphone|ipod|ipad/i.test(ua);
    var isAOS = /android/i.test(ua);

    res.locals.$ua = req.session.$ua = {
        isMobile: isMobile,
        isWeixin: isWeixin,
        isDangkr: isDangkr,
        isIOS: isIOS,
        isAOS: isAOS
    };
    next();
};


