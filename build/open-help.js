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
    open(pkg.help, function(err){
        if(err){
            log('open help', pkg.help, 'error');
            log('open help', err.message, 'error');
            process.exit();
        }

        log('open help', pkg.help, 'success');
    });
};
