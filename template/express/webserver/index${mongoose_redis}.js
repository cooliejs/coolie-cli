/**
 * webserver index
 * @author ydr.me
 * @create 2015-04-29 14:23
 */


'use strict';

var howdo = require('howdo');
var cache = require('ydr-utils').cache;
var log = require('ydr-utils').log;
var system = require('ydr-utils').system;
var request = require('ydr-utils').request;
var console = require('ydr-utils').console;

var serviceCache = require('./services/cache.js');
var serviceConsole = require('./services/console.js');
var serviceRequest = require('./services/request.js');
var serviceLog = require('./services/log.js');
var serviceMongoose = require('./services/mongoose.js');
var serviceRdis = require('./services/redis.js');
var serviceExpress = require('./services/express.js');
var serviceRouters = require('./services/routers.js');
var configs = require('../configs.js');
var pkg = require('../package.json');

module.exports = function (callback) {
    howdo
        .task(serviceCache)
        .task(serviceConsole)
        .task(serviceRequest)
        .task(serviceLog)
        .task(serviceMongoose)
        .task(serviceExpress)
        .task(serviceRdis)
        .task(serviceRouters)
        .follow(callback)
        .try(function (app) {
            var table = [
                ['app name', pkg.name],
                ['app version', pkg.version],
                ['app url', 'http://' + system.localIP() + ':' + app.get('port')],
                ['app root', configs.root],
                ['node version', process.versions.node],
                ['express version', pkg.dependencies.express]
            ];

            console.table(table, {
                tdBorder: true,
                colors: ['green', 'bold']
            });
        })
        .catch(function (err) {
            console.error(err);
            return process.exit(-1);
        });
};