/**
 * 路由
 * @author ydr.me
 * @create 2015-04-29 14:32
 */


'use strict';


module.exports = function (next, app) {
    // home
    require('../controllers/home.js')(app);

    // 程序路由优先，最后静态路由
    require('../controllers/static.js')(app);

    // 路由终点
    require('../controllers/error.js')(app);

    next(null, app);
};



