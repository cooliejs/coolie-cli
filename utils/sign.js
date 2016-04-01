/**
 * 文件构建签名
 * @author ydr.me
 * @create 2015-05-03 04:12
 */


'use strict';

var pkg = require('../package.json');

var sign = module.exports = function (type) {
    var banner = pkg.name + ' built';

    switch (type) {
        case 'html':
            return '<!--' + banner + '-->';

        case 'css':
        case 'js':
            return '/*' + banner + '*/';
    }
};

sign.html = function () {
    return sign('html');
};

sign.js = function () {
    return sign('js');
};

sign.css = function () {
    return sign('css');
};
