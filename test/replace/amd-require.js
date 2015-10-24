/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-23 15:24
 */


'use strict';

var path = require('path');

var replaceAMDRequire = require('../../replace/amd-require.js');
var globalId = require('../../utils/global-id.js');

var file = __filename;
var code = 'define(function(s,e,i){"use strict";s("../libs/all.js");console.log("app/index.js")});';

// 预先注入几个文件
globalId.get(file);

var ret = replaceAMDRequire(file, {
    code: code,
    depName2IdMap: {
        '../libs/all.js': 'n'
    }
});

console.log(ret);

