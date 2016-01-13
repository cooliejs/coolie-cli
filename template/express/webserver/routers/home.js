/**
 * home 路由
 * @author ydr.me
 * @create 2016-01-13 14:47
 */


'use strict';

module.exports = function (app, controller) {
    app.get('/', controller.getHome);
};


