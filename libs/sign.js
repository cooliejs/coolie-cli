/*!
 * 文件签名
 * @author ydr.me
 * @create 2015-05-03 04:12
 */


'use strict';

var pkg = require('../package.json');

module.exports = function (type) {
    var banner = 'coolie@' + pkg.version + ' ' + Date.now();

    switch (type) {
        case 'html':
            return '\n<!--' + banner + '-->';

        case 'css':
        case 'js':
            return '/*' + banner + '*/';
    }
};
