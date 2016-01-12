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
var cmdBuild = require('./cmds/build.js');

var middleware = new Middleware({
    async: false
});
var emitter = new Emitter();


/**
 * API 出口
 * @param options {Object} 配置
 * @returns {{
 * matchHTML: function,
 * buildCSSPath: function,
 * buildJSPath: function,
 * buildResPath: function,
 * }}
 */
module.exports = function (options) {
    return cmdBuild({
        srcDirname: options.srcDirname
    });
    //var configs = parseCoolieConfig({
    //    srcDirname: options.srcDirname,
    //    middleware: middleware,
    //    emitter: emitter
    //});
    //
    //var coolieAPI = buildAPI(configs, middleware);
    //middleware._execSync();
    //return coolieAPI;
};


