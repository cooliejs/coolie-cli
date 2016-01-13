/*!
 * run express
 * @author ydr.me
 * @create 2015-04-29 14:09
 */


'use strict';
var array = [];


var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var sessionParser = require('express-session');
var Template = require('ydr-utils').Template;
var cache = require('ydr-utils').cache;
var random = require('ydr-utils').random;
var encryption = require('ydr-utils').encryption;

require('../utils/template-filters.js')(Template);

module.exports = function (next) {
    var app = express();

    var configs = cache.get('app.configs');

    Template.config({
        debug: 'local' === configs.env,
        cache: 'local' !== configs.env,
        compress: false
    });

    //////////////////////////////////////////////////////////////////////
    ////////////////////////////[ setting ]///////////////////////////////
    //////////////////////////////////////////////////////////////////////
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


    // 解析cookie请求
    // http://www.cnblogs.com/qiuyeyaozhuai/archive/2013/04/28/3043157.html
    app.use(cookieParser(configs.cookie.secret));


    // 要放在cookieParser后面
    app.use(sessionParser({
        genid: function () {
            return random.string(10, 'Aa0-_.') + random.guid();
        },
        resave: true,
        saveUninitialized: true,
        secret: configs.cookie.secret
    }));


    // strict - only parse objects and arrays. (default: true)
    // limit - maximum request body size. (default: <100kb>)
    // reviver - passed to JSON.parse()
    // type - request content-type to parse (default: json)
    // verify - function to verify body content
    app.use(bodyParser.json({
        strict: true,
        limit: '100kb',
        type: 'json'
    }));


    // extended - parse extended syntax with the qs module. (default: true)
    // limit - maximum request body size. (default: <100kb>)
    // type - request content-type to parse (default: urlencoded)
    // verify - function to verify body content
    app.use(bodyParser.urlencoded({
        extended: true
    }));


    app.listen(configs.port, function (err) {
        next(err, app);
    }).on('error', next);
};
