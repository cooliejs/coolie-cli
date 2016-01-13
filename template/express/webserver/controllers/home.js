/**
 * home 控制器
 * @author ydr.me
 * @create 2016-01-13 14:45
 */


'use strict';

module.exports = function (app) {
    app.get('/', function (req, res, next) {
        res.send('home');
    });
};


