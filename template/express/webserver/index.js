/**
 * webserver index
 * @author ydr.me
 * @create 2015-04-29 14:23
 */


'use strict';

var howdo = require('howdo');
var cache = require('ydr-utils').cache;
var system = require('ydr-utils').system;

var log = require('./servers/log.js');
var express = require('./servers/express.js');
var routers = require('./servers/routers.js');
var configs = require('../configs.js');
var pkg = require('../package.json');

cache.config({
    debug: 'local' === configs.env
});

cache.set('app.configs', configs);

module.exports = function () {
    howdo
        .task(log)
        .task(express)
        .task(routers)

  