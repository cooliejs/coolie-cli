/*!
 * chunk 模块构建
 * @author ydr.me
 * @create 2015-06-25 15:25
 */


'use strict';

var dato = require('ydr-utils').dato;

module.exports = function () {
    var configs = global.configs;
    var chunkList = [];

    dato.each(configs._chunkModuleIdMap, function (mod, mid) {
        var index = configs._chunkFileMap[mod] * 1;

        chunkList[index] = chunkList[index] || [];
        chunkList[index].push(mod);
    });

    console.log(chunkList);
};

