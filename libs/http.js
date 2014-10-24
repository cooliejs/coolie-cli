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
        var bufferList = [];

        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            bufferList.push(new Buffer(chunk, 'utf8'));
        });
        res.on('end', function () {
            callback(null, Buffer.concat(bufferList).toString());
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
