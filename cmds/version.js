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
var banner = require('./banner.js');

module.exports = function () {
    banner();
    debug.success('local coolie-cli', pkg.version);
    console.loading();
    howdo
        // 获取 coolie.cli 版本
        .task(function (done) {
            npm.getLatestVersion(pkg.name, function (err, version) {
                if (err) {
                    return done(err);
                }


                done(err, version);
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


                done(err, json.version);
            });
        })
        .together(function () {
            console.loadingEnd();
        })
        .try(function (coolieCliVersion, coolieJSVersion) {
            debug.success('online coolie-cli', coolieCliVersion);
            debug.success('online coolie.js', coolieJSVersion);
        })
        .catch(function (err) {
            debug.error('error', err.message);
            return process.exit(1);
        });
};



