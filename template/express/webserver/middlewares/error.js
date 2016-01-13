/**
 * error
 * @author ydr.me
 * @create 2016-01-13 21:54
 */


'use strict';


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




