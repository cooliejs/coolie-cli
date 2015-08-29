/*!
 * 构建 css 模块
 * @author ydr.me
 * @create 2015-08-28 23:12
 */


'use strict';

var fse = require('fs-extra');
var cssminify = require('../libs/cssminify.js');

module.exports = function (file, pipeline, options) {
    pipeline = pipeline.split('|');

    var code = fse.readFileSync(file, 'utf8');

    cssminify(file, code);
    return code;
};

