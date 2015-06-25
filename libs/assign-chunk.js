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

/**
 * 智能分配 chunk
 * @param mainMap {Object} 入口 map
 *
 * @example
 * // 合法的 mainMap
 * {
 *     // 入口文件绝对路径
 *     mainFile: "/path/to/main.js",
 *     // bufferList 是入口模块独有的模块
 *     bufferList: [bf1, bf2, ...]
 * }
 */
module.exports = function (mainMap) {
    var configs = global.configs;

    dato.each(configs._chunkModuleMap, function (mod, meta) {
        // 仅被一个入口模块使用的 chunk 模块
        if (meta.depending.length === 1) {
            var depending = meta.depending[0];
            var bfList = mainMap[depending].bufferList;

            bfList.push(configs._chunkBufferMap[mod]);

            delete(configs._chunkModuleMap[mod]);
        }

        //// 被多个入口模块使用的 chunk 模块
        //configs._chunkMap
    });

    // 2. 仅使用一次的 chunk 回归到原来的位置

    return mainMap;
};

