/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-08-12 09:20
 */


'use strict';

var request = require('ydr-utils').request;
var log = require('../libs/log.js');
var pkg = require('../package.json');
var howdo = require('howdo');
var currentVersion = pkg.version;
var coolieCliURL = 'http://registry.npmjs.com/coolie';
var coolieJSURL = 'https://raw.githubusercontent.com/cloudcome/coolie/master/package.json';

module.exports = function(){
    log('local version', currentVersion, 'success');
    log('check version', 'wait a moment...');

    howdo
        // 检查 coolie cli 版本
        .task(function () {
            request.get(coolieCliURL, function (err, data) {
                if(err){
                    log('check version', 'connect npmjs.com error', 'error');
                    process.exit(1);
                }

                var json = {};

                try{
                    json = JSON.parse(data);
                }catch(err){
                    log('check version', 'parse json string error', 'error');
                    process.exit(1);
                }

                log('coolie.cli', json['dist-tags'].latest, 'success');
            });
        })
        // 检查 coolie.js 版本
        .task(function () {
            request.get(coolieJSURL, function (err, data) {
                if(err){
                    log('check version', 'connect github.com error', 'error');
                    process.exit(1);
                }

                var json = {};

                try{
                    json = JSON.parse(data);
                }catch(err){
                    log('check version', 'parse json string error', 'error');
                    process.exit(1);
                }

                log('coolie.js', json.version, 'success');
            });
        })
        .together(function () {
            //
        });
};


