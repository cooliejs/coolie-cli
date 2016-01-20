/**
 * webserver index
 * @author ydr.me
 * @create 2015-04-29 14:23
 */


'use strict';

var howdo = require('howdo');
var cache = require('ydr-utils').cache;
var system = require('ydr-utils').system;

var serviceLog = require('./services/log.js');
var serviceMongoose = require('./services/mongoose.js');
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
        .task(serviceMongoose)
        .task(serviceExpress)
        .task(serviceRouters)
        .follow(callback)
        .try(function (app) {
            console.log();
            console.log('############################################');
            console.log(pkg.name + '@' + pkg.version, 'http://' + system.localIP() + ':' + app.get('port'));
            console.log('############################################\n');
            console.log();
        })
        .catch(function (err) {
            console.error(err);
            return process.exit(-1);
        });
};