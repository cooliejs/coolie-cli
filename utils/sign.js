/**
 * 文件构建签名
 * @author ydr.me
 * @create 2015-05-03 04:12
 */


'use strict';

var pkg = require('../package.json');

module.exports = function (type) {
    var banner = pkg.name + '@' + pkg.version;

    switch (type) {
        case 'html':
            return '<!--' + banner + '-->';

        case 'css':
        case 'js':
            return '/*' + banner + '*/';
    }
};
