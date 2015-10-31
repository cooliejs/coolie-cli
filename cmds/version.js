/**
 * 检查版本
 * @author ydr.me
 * @create 2015-10-31 13:58
 */


'use strict';

var request = require('ydr-utils').request;
var npm = require('ydr-utils').npm;
var debug = require('ydr-utils').debug;
var howdo = require('howdo');

var pkg = require('../package.json');

module.exports = function () {
    debug.success('local version', pkg.version);
    debug.success('check version', 'wait a moment...');
    howdo
        // 获取 coolie.cli 版本
        .task(function (done) {
            npm.getLatestVersion(pkg.name, function (err, version) {
                if (err) {
                    return done(err);
                }

                debug.success('coolie cli', version);
            });
        })
        // 获取 coolie.js 版本
        .task(function (done) {
            request.get({
                url: pkg.coolie['package.json'],
                query: {
                    _: Date.now()
                }
            }, function (err, data) {
                if (err) {
                    return done(err);
                }

                var json = {};

                try {
                    json = JSON.parse(data);
                } catch (err) {
                    return done(new Error('parse error'));
                }

                debug.success('coolie.js', json.version);
            });
        })
        .together()
        .catch(function (err) {
            debug.error('error', err.message);
            return process.exit(1);
        });
};



