/**
 * 链接 redis
 * @author ydr.me
 * @create 2016-03-04 10:02
 */


'use strict';

var sessionParser = require('express-session');
var RedisStore = require('connect-redis')(sessionParser);
var controller = require('ydr-utils').controller;

var configs = require('../../configs.js');

module.exports = function (next, app) {
    var sessionStore = new RedisStore(configs.redis);
    var complete = controller.once(function (err) {
        if (err) {
            err.redisURL = configs.redis;
        }

        next(err, app, sessionStore);
    });

    sessionStore.on('connect', function () {
        console.info('connect redis store success');
        complete();
    });

    sessionStore.on('disconnect', function () {
        var err = new Error('disconnect redis store');
        complete(err);
    });

    sessionStore.on('error', function (err) {
        complete(err);
    });
};

