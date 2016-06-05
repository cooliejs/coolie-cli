/**
 * coolie book 地址
 * @author ydr.me
 * @create 2016-05-29 22:08
 */


'use strict';

var url = require('blear.utils.url');
var console = require('blear.node.console');


var pkg = require('../../package.json');


module.exports = function (pathname) {
    return url.join(pkg.homepage, pathname || '/') +
        '?from=' + pkg.name + '=' + pkg.version;
};


