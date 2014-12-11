/*!
 * 构建帮助
 * @author ydr.me
 * @create 2014-11-14 16:50
 */

'use strict';

var open = require('open');
var pkg = require('../package.json');
var log = require('../libs/log.js');

module.exports = function () {
    open(pkg.wiki, function(err){
        if(err){
            log('open wiki', pkg.wiki, 'error');
            log('open wiki', err.message, 'error');
            process.exit();
        }

        log('open wiki', pkg.wiki, 'success');
    });
};
