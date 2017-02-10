/**
 * 链接 redis
 * @author ydr.me
 * @create 2016-03-04 10:02
 */


'use strict';

var Redis = require('blear.classes.redis');
var console = require('blear.node.console');
var fun = require('blear.utils.function');

var configs = require('../../configs.js');

module.exports = function (next, app) {
    var redis = new Redis(configs.redis);
    var complete = fun.once(function (err) {
        if (err) {
            err.redisURL = configs.redis;
        }

        app.redis = redis;
        next(err, app);
    });

    redis.on('connect', function () {
        console.info('connect redis store success');
        complete();
    });

    redis.on('disconnect', function () {
        var err = new Error('disconnect redis store');
        complete(err);
    });
};

