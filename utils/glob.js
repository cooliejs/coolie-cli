/**
 * glob 分析
 * @author ydr.me
 * @create 2015-10-27 10:58
 */


'use strict';

var glob = require('glob');
var typeis = require('ydr-utils').typeis;
var dato = require('ydr-utils').dato;
var path = require('ydr-utils').path;
var debug = require('ydr-utils').debug;


var defaults = {
    glob: [],
    srcDirname: __dirname,
    globOptions: {
        dot: false,
        nodir: true
    },
    progress: null
};

/**
 * glob 分析
 * @param options {Object} 配置
 * @param options.glob {String|Array} 规则字符串或数组
 * @param options.srcDirname {String} 原始目录
 * @param options.globOptions {Object} glob 配置
 * @param options.progress {Function} 过程回调
 * @returns {Array}
 */
module.exports = function (options) {
    var files = [];

    options = dato.extend(true, {}, defaults, options);
    options.glob = typeis.array(options.glob) ? options.glob : [options.glob];

    dato.each(options.glob, function (indexGlob, p) {
        var p2 = path.join(options.srcDirname, p);

        var _files = [];

        try {
            _files = glob.sync(p2, options.globOptions);
        } catch (err) {
            debug.error('glob', p);
            debug.error('glob', err.message);
            return process.exit(1);
        }

        if (typeis.function(options.progress)) {
            dato.each(_files, function (indexFile, _file) {
                options.progress(indexGlob, indexFile, _file);
            });
        }

        files = files.concat(_files);
    });

    return files;
};


