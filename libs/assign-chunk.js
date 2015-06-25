/*!
 * 分配 chunk 文件
 * @author ydr.me
 * @create 2015-06-25 23:47
 */


/******************************************************************\
 *
 * 只有被 2 个（含）以上的入口模块使用过的 chunk 模块才会被公共出来，
 * 否则的会还是会被合并到入口模块里
 *
 \******************************************************************/


'use strict';

var dato = require('ydr-utils').dato;
var encryption = require('ydr-utils').encryption;
var pathURI = require('./path-uri.js');


/**
 * 智能分配 chunk
 * @param mainMap {Object} 入口 map
 * @param versionMap {Object} 版本 map
 *
 * @example
 * // 合法的 mainMap
 * "/path/to/main.js": {
 *     // 入口文件绝对路径
 *     mainFile: "/path/to/main.js",
 *     // bufferList 是入口模块独有的模块
 *     bufferList: [bf1, bf2, ...]
 * }
 */
module.exports = function (mainMap, versionMap) {
    var configs = global.configs;

    dato.each(configs._chunkModuleMap, function (mod, meta) {
        // 仅被一个入口模块使用的 chunk 模块
        if (meta.depending.length === 1) {
            var depending = meta.depending[0];

            mainMap[depending].bufferList.push(configs._chunkBufferMap[mod]);
            mainMap[depending].bufferList = [];
            mainMap[depending].md5List += configs._chunkMD5Map[mod];

            delete(configs._chunkModuleMap[mod]);
        }

        //// 被多个入口模块使用的 chunk 模块
        //configs._chunkMap
    });

    dato.each(mainMap, function (mainFile, main) {
        var version = encryption.md5(main.md5List);

        main.destName = pathURI.replaceVersion(main.srcName, version);
        versionMap[pathURI.toURIPath(main.srcName)] = version;
    });
};

