/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-31 00:00
 */


'use strict';

var fs = require('fs');


var REG_INCLUDE = /\{\{include (.*?)}}/g;


module.exports = function includeHTML(options) {
    var coolie = this;

    //this.middlewareName = 'replace include html template';
    // 正则匹配 {{include *}} 标记并替换
    options.code = options.code.replace(REG_INCLUDE, function (input, inludeName) {
        var includeFile = coolie.utils.getAbsolutePath(inludeName, options.file);
        var includeCode = '';

        if (!includeFile) {
            return input;
        }

        includeCode = fs.readFileSync(includeFile, 'utf-8');

        return includeCode123;
    });

    return options;
};
module.exports.middlewareName = 'replace html include html template';

