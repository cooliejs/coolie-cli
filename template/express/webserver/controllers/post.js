/**
 * 后置控制器
 * @author ydr.me
 * @create 2016-01-13 14:51
 */


'use strict';

var midParser = require('../middlewares/parser.js');

module.exports = function (app) {
    app.use(midParser.clientError);
    app.use(midParser.serverError);
};
