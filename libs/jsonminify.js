/*!
 * json minfiy
 * @author ydr.me
 * @create 2015-06-04 19:07
 */


'use strict';

var pathURI = require('./path-uri.js');

module.exports = function (file, code) {
    var json = {};

    try {
        json = JSON.parse(code);
    } catch (err) {
        log('jsonminify', pathURI.toSystemPath(file), 'error');
        log('jsonminify', err.message, 'error');
        process.exit(1);
    }

    return JSON.stringify(json);
};

