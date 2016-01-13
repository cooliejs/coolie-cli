/**
 * 错误中间件
 * @author ydr.me
 * @create 2016-01-13 14:51
 */


'use strict';

module.exports = function (app) {
    // 404
    app.use(function clientError(req, res, next) {
        res.status(404);
        res.send('404');
    });

    // 500
    app.use(function serverError(err, req, res, next) {
        res.status(500);
        res.send('500');
    });
};
