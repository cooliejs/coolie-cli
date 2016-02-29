/**
 * run express
 * @author ydr.me
 * @create 2015-04-29 14:09
 */


'use strict';

var express = require('express');
var path = require('ydr-utils').path;
var Template = require('ydr-utils').Template;
var cache = require('ydr-utils').cache;

var configs = require('../../configs.js');

require('../utils/template-filters.js')(Template);

module.exports = function (next) {
    var app = express();

    Template.config({
        debug: 'local' === configs.env,
        cache: 'local' !== configs.env,
        compress: false
    });

    app.set('env', configs.env);
    app.set('port', configs.port);
    app.set('views', path.join(configs.webroot, './.views/'));
    app.engine('html', Template.__express);
    app.set('view engine', 'html');

    // 路由区分大小写，默认 disabled
    app.set('case sensitive routing', true);

    // 严格路由，即 /a/b !== /a/b/
    app.set('strict routing', false);

    app.set('jsonp callback name', 'callback');
    app.set('json spaces', 'local' === configs.env ? 4 : 0);
    app.set('view cache', 'local' !== configs.env);

    next(null, app);
};
