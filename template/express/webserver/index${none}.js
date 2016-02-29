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

var serviceLog = require('./services/log.js');
var serviceExpress = require('./services/express.js');
var serviceRouters = require('./services/routers.js');
var configs = require('../configs.js');
var pkg = require('../package.json');

cache.config({
    debug: 'local' === configs.env
});

cache.set('app.configs', configs);

module.exports = function (callback) {
    howdo
        .task(serviceLog)
        .task(serviceExpress)
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

            log.success(log.table(table, {
                tdBorder: true
            }));
        })
        .catch(function (err) {
            console.error(err);
            return process.exit(-1);
        });
};