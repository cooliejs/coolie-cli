/*!
 * 检查更新
 * @author ydr.me
 * @create 2014-10-24 16:08
 */

'use strict';

var request = require('ydr-utils').request;
var log = require('../libs/log.js');
var pkg = require('../package.json');
var howdo = require('howdo');
var currentVersion = pkg.version;
var url1 = 'http://registry.npmjs.com/coolie';
var url2 = 'https://raw.githubusercontent.com/cloudcome/coolie/master/package.json';

module.exports = function(){
    log('local version', currentVersion, 'success');
    log('check update', 'wait a moment...');

    howdo
        // 检查 coolie cli 版本
        .task(function () {
            request.get(url1, function (err, data) {
                if(err){
                    log('check update', 'connect npmjs.com error', 'error');
                    process.exit(1);
                }

                var json = {};

                try{
                    json = JSON.parse(data);
                }catch(err){
                    log('check update', 'parse json string error', 'error');
                    process.exit(1);
                }

                log('coolie.cli', json['dist-tags'].latest, 'success');
            });
        })
        // 检查 coolie.js 版本
        .task(function () {
            request.get(url2, function (err, data) {
                if(err){
                    log('check update', 'connect github.com error', 'error');
                    process.exit(1);
                }

                var json = {};

                try{
                    json = JSON.parse(data);
                }catch(err){
                    log('check update', 'parse json string error', 'error');
                    process.exit(1);
                }

                log('coolie.js', json.version, 'success');
            });
        })
        .together(function () {
            //
        });
};
