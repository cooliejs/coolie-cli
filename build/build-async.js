/*!
 * 构建 async
 * @author ydr.me
 * @create 2015-10-01 14:34
 */


'use strict';

var dato = require('ydr-utils').dato;

var buildMain = require('./build-main.js');

module.exports = function (versionMap, callback) {
    var configs = global.configs;

    dato.each(configs._asyncMap, function (asynMain, info) {
        //console.log(asynMain);
        //console.log(info.depending);
        //console.log(configs._mainMap[info.depending[0]]);

        buildMain(asynMain, function () {

        });
    });
};

