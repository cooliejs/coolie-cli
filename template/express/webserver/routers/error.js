/**
 * 错误路由
 * @author ydr.me
 * @create 2016-01-13 14:53
 */


'use strict';


module.exports = function (app, controller) {
    app.use(controller.clientError);
    app.use(controller.serverError);
};