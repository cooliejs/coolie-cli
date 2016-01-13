/**
 * 解析类中间件
 * @author ydr.me
 * @create 2016-01-13 15:11
 */


'use strict';


// 解析 ua
exports.parseUA = function parseUA(req, res, next) {
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


// 解析 404
exports.clientError = function clientError(req, res, next) {
    res.status(404);
    res.send('404');
};


// 解析 500
exports.serverError = function serverError(req, res, next) {
    res.status(500);
    res.send('500');
};



