/**
 * 配置文件
 * @author ydr.me
 * @create 2016年01月13日14:30:30
 */


'use strict';

var path = require('path');

var env = process.env.ENVIRONMENT || 'local';
var webroot = env === 'local' ? 'dev' : 'pro';
var root = __dirname;

module.exports = {
    port: 10000,
    env: env,
    webroot: path.join(root, './webroot-' + webroot)
};
