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

var configs = require('../../configs.js');


// 解析 cookie
exports.parseCookie = cookieParser(configs.cookie.secret);


// 解析 session
exports.parseSession = sessionParser({
    genid: function () {
        return random.string(10, 'Aa0-_.') + random.guid();
    },
    resave: true,
    saveUninitialized: true,
    secret: configs.cookie.secret
});


// strict - only parse objects and arrays. (default: true)
// limit - maximum request body size. (default: <100kb>)
// reviver - passed to JSON.parse()
// type - request content-type to parse (default: json)
// verify - function to verify body content
exports.parsePostBodyOfJSON = bodyParser.json({
    strict: true,
    limit: '100kb',
    type: 'json'
});


// extended - parse extended syntax with the qs module. (default: true)
// limit - maximum request body size. (default: <100kb>)
// type - request content-type to parse (default: urlencoded)
// verify - function to verify body content
exports.parsePostBodyOfURLencoded = bodyParser.urlencoded({
    extended: true
});


// 解析 ua
exports.parseUA = function(req, res, next) {
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


