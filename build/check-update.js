/*!
 * 检查更新
 * @author ydr.me
 * @create 2014-10-24 16:08
 */

'use strict';

var http = require('../libs/http.js');
var log = require('../libs/log.js');
var pkg = require('../package.json');
var currentVersion = pkg.version;
var url = 'http://registry.npmjs.org/coolie';

module.exports = function(){
    log('check update', 'wait a moment');

    http(url, function (err, data) {
        if(err){
            log('check update', 'connect npmjs.org error', 'error');
            process.exit();
        }

        var json = {};

        try{
            json = JSON.parse(data);
        }catch(err){
            log('check update', 'parse json string error', 'error');
            process.exit();
        }

        log('local version', currentVersion, 'success');
        log('online version', json['dist-tags'].latest, 'success');
    });
};
