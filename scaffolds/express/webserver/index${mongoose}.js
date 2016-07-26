/**
 * webserver index
 * @author ydr.me
 * @create 2015-04-29 14:23
 */


'use strict';

var howdo = require('howdo');
var system = require('blear.node.system');
var console = require('blear.node.console');
var date = require('blear.utils.date');

var serviceConsole = require('./services/console.js');
var serviceLog = require('./services/log.js');
var serviceExpress = require('./services/express.js');
var serviceMongoose = require('./services/mongoose.js');
var serviceRouters = require('./services/routers.js');
var configs = require('../configs.js');
var pkg = require('../package.json');

module.exports = function (callback) {
    howdo
        .task(serviceConsole)
        .task(serviceLog)
        .task(serviceExpress)
        .task(serviceMongoose)
        .task(serviceRouters)
        .follow(callback)
        .try(function (app) {
            var table = [
                ['start time', date.format('YYYY-MM-DD HH:mm:ss.SSS')],
                ['app name', pkg.name],
                ['app version', pkg.version],
                ['app url', 'http://' + system.localIP() + ':' + app.get('port')],
                ['app root', configs.root],
                ['node version', process.versions.node],
                ['node env', process.env.NODE_ENV],
                ['express version', require('express/package.json').version]
            ];

            console.table(table, {
                border: true,
                colors: ['green', 'bold']
            });
        })
        .catch(function (err) {
            console.error(err);
            return process.exit(-1);
        });
};