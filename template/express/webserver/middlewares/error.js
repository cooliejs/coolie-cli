/**
 * 错误中间件
 * @author ydr.me
 * @create 2016-01-13 14:51
 */


'use strict';


// 404
exports.clientError = function (req, res, next) {
    res.status(404);
    res.send('404');
};


// 500
exports.clientError = function (req, res, next) {
    res.status(500);
    res.send('500');
};


