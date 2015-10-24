/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-23 15:24
 */


'use strict';

var path = require('path');

var replaceAMDRequire = require('../../replace/amd-require.js');

var file = __filename;
var code1 = 'define(function(s,e,i){"use strict";s("../libs/all.js");console.log("app/index.js")});';
var code2 = 'define(function(s,e,i){"use strict";s.async("../libs/all.js");console.log("app/index.js")});';

var ret1 = replaceAMDRequire(file, {
    code: code1,
    depName2IdMap: {
        '../libs/all.js': 'n'
    }
});
var ret2 = replaceAMDRequire(file, {
    code: code2,
    async: true,
    depName2IdMap: {
        '../libs/all.js': 'n'
    }
});

console.log(ret1);
console.log(ret2);

