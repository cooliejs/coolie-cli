/**
 * 检查版本
 * @author ydr.me
 * @create 2015-10-31 13:58
 */


'use strict';

var debug = require('blear.node.debug');
var console = require('blear.node.console');


var pkg = require('../../package.json');
var banner = require('./banner.js');
var getModulesVersion = require('../utils/get-modules-version');

module.exports = function () {
    banner();
    debug.success('local coolie-cli', pkg.version);
    console.loading();

    getModulesVersion([
        'coolie',
        'coolie.js'
    ], function (err, map) {
        console.loadingEnd();

        if (err) {
            debug.error('error', err.message);
            return process.exit(1);
        }

        debug.success('online coolie-cli', map.coolie);
        debug.success('online coolie.js', map['coolie.js']);
    });
};



