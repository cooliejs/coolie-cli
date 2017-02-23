/**
 * API 出口
 * @author ydr.me
 * @create 2014-10-22 16:16
 */

'use strict';

var object = require('blear.utils.object');
var console = require('blear.node.console');
var path = require('blear.node.path');

console.config({
    level: process.env.CLOUDCOME_MAC === 'YES' ? ['log', 'error'] : ['log']
});

var requireParser = require('./src/parse/require');

var NODE_MODUELS = 'node_modules';

exports.parseRequire = function (file, options) {
    options = object.assign({
        deep: true,
        nodeModulesDirname: path.join(process.cwd(), NODE_MODUELS)
    }, options);

    console.error(options);
};


