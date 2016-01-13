/**
 * webserver index
 * @author ydr.me
 * @create 2015-04-29 14:23
 */


'use strict';

var howdo = require('howdo');
var cache = require('ydr-utils').cache;
var system = require('ydr-utils').system;

var splitLog = require('./split-log.js');
var express = require('./express.js');
var routers = require('./routers.js');
var configs = require('../configs.js');
var pkg = require('../package.json');

cache.config({
    debug: 'local' === configs.env
});

cache.set('app.configs', configs);

module.exports = function () {
    howdo
        .task(splitLog)
        .task(express)
        .task(routers)
        .follow(function (err, app) {
            if (err) {
                console.error(err);
                return process.exit(-1);
            }

            console.log();
            console.log('############################################');
            console.log(pkg.name + '@' + pkg.version, 'http://' + system.localIP() + ':' + configs.port);
            console.log('############################################\n');
            console.log();
        });
};

  