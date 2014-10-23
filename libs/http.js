/*!
 * http
 * @author ydr.me
 * @create 2014-10-22 18:49
 */

'use strict';

var http = require('http');


// http://registry.npmjs.org/coolie
module.exports = function (url, callback) {
    var req = http.request(url, function (res) {
        var data = '';

        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            data+=chunk;
        });
        res.on('end', function () {
            callback(data);
        });

        res.on('error', function(err){
            callback(err);
        });
    });

    req.on('error', function (err) {
        callback(err);
    });

    req.end();

};
