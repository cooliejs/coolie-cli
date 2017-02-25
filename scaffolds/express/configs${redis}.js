/**
 * 配置文件
 * @author ydr.me
 * @create 2016年01月13日14:30:30
 */


'use strict';

var path = require('path');
var pkg = require('./package.json');

var env = getEnv();
var webroot = env === 'local' ? 'dev' : 'pro';
var root = __dirname;
var port = 10000;

module.exports = {
    port: port,
    env: env,
    root: root,
    webroot: path.join(root, './webroot-' + webroot),
    redis: {
        local: {
            url: 'redis://127.0.0.1:6379',
            db: 0,
            pass: 'REDIS_PASSWORD',
            prefix: pkg.name + ':'
        },
        dev: {
            url: 'redis://127.0.0.1:6379',
            db: 0,
            pass: 'REDIS_PASSWORD',
            prefix: pkg.name + ':'
        },
        test: {
            url: 'redis://127.0.0.1:6379',
            db: 0,
            pass: 'REDIS_PASSWORD',
            prefix: pkg.name + ':'
        },
        pro: {
            url: 'redis://127.0.0.1:6379',
            db: 0,
            pass: 'REDIS_PASSWORD',
            prefix: pkg.name + ':'
        }
    }[env],
    redisKey: {
        session: pkg.name + ':session:'
    },
    cookie: {
        secret: 'express-template',
        // 30d
        expires: 30 * 24 * 60 * 60 * 1000,
        sessionName: 's' + port
    },
    logLevel: {
        local: ['log', 'info', 'warn', 'error'],
        dev: ['log', 'info', 'warn', 'error'],
        test: ['log', 'info', 'warn', 'error'],
        pro: ['warn', 'error']
    }[env],
    api: 'http://api.com'
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

