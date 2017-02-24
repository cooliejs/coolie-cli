/**
 * API 出口
 * @author ydr.me
 * @create 2014-10-22 16:16
 */

'use strict';

var object = require('blear.utils.object');
var console = require('blear.node.console');
var path = require('blear.node.path');
var fse = require('fs-extra');

console.config({
    level: process.env.CLOUDCOME_MAC === 'YES' ? ['log', 'error'] : ['log']
});

var requireParser = require('./src/parse/require');

var NODE_MODUELS = 'node_modules';

var parseRequire = exports.parseRequire = function (file, options) {
    options = object.assign({
        deep: true,
        nodeModulesDirname: path.join(process.cwd(), NODE_MODUELS),
        code: null
    }, options);
    options.code = options.code || fse.readFileSync(file, 'utf-8');
    options.srcCoolieConfigNodeModulesDirname = options.nodeModulesDirname;
    options.coolieConfigs = {};
    options.async = false;

    var requireList = requireParser(file, options);

    if (!options.deep) {
        return requireList;
    }

    var parsedMap = {};
    var parsedList = [];

    options.deep = false;
    options.code = null;

    function deep(fileList) {
        fileList.forEach(function (fileItem) {
            var file = fileItem.file;

            if (parsedMap[fileItem.file]) {
                return;
            }

            parsedList.push(fileItem);
            parsedMap[fileItem.file] = true;
            deep(parseRequire(file, options));
        });
    }

    deep(requireList);
    return parsedList;
};


