/**
 * 日志
 * @author ydr.me
 * @create 2016-01-13 21:34
 */


'use strict';

var path = require('ydr-utils').path;
var log = require('ydr-utils').log;
var request = require('ydr-utils').request;

var configs = require('../../configs.js');

var PM2_LOG = path.join(configs.root, './logs/pm2.log');


module.exports = function (next) {
    log.config({
        whiteList: configs.logLevel
    });

    request.defaults.debug = configs.logLevel.indexOf('info') > -1;

    next();
};




