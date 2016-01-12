/**
 * API 出口
 * @author ydr.me
 * @create 2014-10-22 16:16
 */

'use strict';


var Middleware = require('ydr-utils').Middleware;
var Emitter = require('ydr-utils').Emitter;

var parseCoolieConfig = require('./parse/coolie.config.js');
var buildAPI = require('./build/api.js');

var middleware = new Middleware({
    async: false
});
var emitter = new Emitter();


/**
 *
 * @param options {Object} 配置
 */
module.exports = function (options) {
    var configs = parseCoolieConfig({
        srcDirname: options.srcDirname,
        middleware: middleware,
        emitter: emitter
    });

    return buildAPI(configs, middleware);
};


