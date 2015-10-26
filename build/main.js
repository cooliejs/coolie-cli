/**
 * 构建入口模块
 * @author ydr.me
 * @create 2015-10-26 15:33
 */


'use strict';


var reader = require('../utils/reader.js');
var parseAMDRequire = require('../parse/cmd-require.js');

/**
 * 构建入口模块
 * @param file {String} 入口路径
 * @param options {Object} 配置
 * @param options.async {Boolean} 是否为异步模块
 */
module.exports = function (file, options) {
    // 读取入口模块内容
    var code = reader(file, 'utf8');
    var requires = parseAMDRequire(file, {
        code: code,
        async: options.async
    });
};


