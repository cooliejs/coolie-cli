/**
 * 入口
 * @author ydr.me
 * @create 2014-10-22 16:16
 */

'use strict';


var parseCoolieConfig = require('./parse/coolie.config.js');

var configs = parseCoolieConfig({
    srcDirname: options.srcDirname,
    middleware: middleware,
    emitter: emitter
});
