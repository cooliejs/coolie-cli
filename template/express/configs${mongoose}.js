/**
 * 配置文件
 * @author ydr.me
 * @create 2016年01月13日14:30:30
 */


'use strict';

var path = require('path');

var env = getEnv();
var webroot = env === 'local' ? 'dev' : 'pro';
var root = __dirname;

module.exports = {
    port: 10000,
    env: env,
    root: root,
    webroot: path.join(root, './webroot-' + webroot),
    cookie: {
        secret: 'express-template',
        // 30d
        expires: 30 * 24 * 60 * 60 * 1000
    },
    mongodb: {
        local: 'mongodb://localhost:27017/express-template',
        dev: 'mongodb://localhost:27017/express-template',
        test: 'mongodb://localhost:27017/express-template',
        pro: 'mongodb://localhost:27017/express-template'
    }[env]
};


/**
 * 获取当前环境变量
 * @returns {*|string}
 */
function getEnv() {
    var LOCAL_ENV = 'local';
    var DEVELOPMENT_ENV = 'dev';
    var PRODUCTION_ENV = 'pro';
    var TEST_ENV = 'test';
    //noinspection JSUnresolvedVariable
    var env = process.env.NODE_ENV || process.env.ENVIRONMENT || LOCAL_ENV;

    if (env.indexOf(DEVELOPMENT_ENV) > -1) {
        env = DEVELOPMENT_ENV;
    } else if (env.indexOf(PRODUCTION_ENV) > -1) {
        env = PRODUCTION_ENV;
    } else if (env.indexOf(TEST_ENV) > -1) {
        env = TEST_ENV;
    }

    return (process.env.NODE_ENV = env);
}

