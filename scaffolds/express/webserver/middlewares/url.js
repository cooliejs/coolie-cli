/**
 * url 相关中间件
 * @author ydr.me
 * @create 2016-01-13 15:06
 */


'use strict';

var urlHelper = require('url');

var REG_ENDXIE = /(\/|\.[^\.\/]+)$/;


// 严格 url
exports.strictRouting = function (req, res, next) {
    var urlParser = urlHelper.parse(req.originalUrl);
    var pathname = urlParser.pathname;
    var search = urlParser.search;

    if (!REG_ENDXIE.test(pathname)) {
        return res.redirect(pathname + '/' + (search ? search : ''));
    }

    next();
};

