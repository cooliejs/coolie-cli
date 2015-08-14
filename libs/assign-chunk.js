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
var sign = require('./sign.js');
var fse = require('fs-extra');
var howdo = require('howdo');
var path = require('path');


/**
 * 智能分配 chunk
 * @param mainMap {Object} 入口 map
 * @param versionMap {Object} 版本 map
 * @param callback {Function} 分配完毕回调
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
module.exports = function (mainMap, versionMap, callback) {
    var configs = global.configs;

    // 只有在 1 个 main 以上
    if (Object.keys(mainMap).length > 1) {
        dato.each(configs._chunkModuleMap, function (mod, meta) {
            // 仅被一个入口模块使用的 chunk 模块
            if (meta.depending.length === 1) {
                var depending = meta.depending[0];

                mod = pathURI.toSystemPath(mod);
                mainMap[depending].bufferList.push(configs._chunkBufferMap[mod]);
                mainMap[depending].md5List += configs._chunkMD5Map[mod];

                delete(configs._chunkModuleMap[mod]);
            }
        });
    }

    // 分析 chunk map 成数组
    dato.each(configs._chunkModuleMap, function (mod, meta) {
        var index = configs._chunkFileMap[mod] * 1;

        configs._chunkList[index] = configs._chunkList[index] || [];
        configs._chunkList[index].push(mod);
    });

    howdo.each(mainMap, function (mainFile, main, done) {
        var version = encryption.md5(main.md5List).slice(0, configs.dest.md5Length);

        main.destName = pathURI.replaceVersion(main.srcName, version);
        versionMap[pathURI.toURIPath(main.srcName)] = version;



        var destFile = path.join(configs._destPath, main.destName);
        var output = sign('js');
        var chunkList = [];

        main.chunkList.forEach(function (chunkId) {
            if (configs._chunkList[chunkId] && configs._chunkList[chunkId].length) {
                chunkList.push(chunkId);
            }
        });

        output += Buffer.concat(main.bufferList).toString();

        if (chunkList.length) {
            output += '\ncoolie.chunk(' + joinArr(chunkList) + ');';
        }

        fse.outputFile(destFile, output, function (err) {
            if (err) {
                log('write file', pathURI.toSystemPath(destFile), 'error');
                log('write file', err.message, 'error');
                return process.exit(1);
            }

            done();
        });
    }).together(callback);
};


/**
 * 数组合并并保留字符串
 * @param arr
 * @returns {string}
 */
var joinArr = function (arr) {
    var s = '[';

    arr.forEach(function (item, index) {
        if (index) {
            s += ',';
        }

        s += '"' + item + '"';
    });

    return s + ']';
};
