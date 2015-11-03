/**
 * 生成 coolie 地图
 * @author ydr.me
 * @create 2015-10-29 10:49
 */


'use strict';

var fse = require('fs-extra');
var path = require('ydr-utils').path;
var debug = require('ydr-utils').debug;

var pathURI = require('../utils/path-uri.js');


/**
 * 生成 coolie 地图
 * @param options {Object} 配置
 * @param options.srcDirname {String} 原始目录
 * @param options.destDirname {String} 目标目录
 * @param options.configs {Object} 构建配置
 */
module.exports = function (options) {
    var coolieMapPath = path.join(options.destDirname, './coolie-map.json');
    var coolieMap = {
        html: {
            'html/index.html': {
                main: [{
                    type: 'sync',
                    src: 'static/js/app/index.js',
                    dest: 'static/js/app/{{version}}.js',
                    dependencies: [
                        'static/js/aa.js',
                        'static/js/bb.js'
                    ]
                }],
                js: [{
                    dest: 'static/css/{{version}}.js',
                    dependencies: [
                        'static/css/aa.js'
                    ]
                }],
                css: [{
                    dest: 'static/css/{{version}}.css',
                    dependencies: [{
                        src: 'static/css/aa.css',
                        resource: [
                            'static/img/1.png',
                            'static/img/2.png'
                        ]
                    }]
                }]
            }
        }
    };

    try {
        fse.writeJSONSync(coolieMapPath, coolieMap);
        debug.success('√', pathURI.toRootURL(coolieMapPath, options.srcDirname));
        return coolieMapPath;
    } catch (err) {
        debug.error('write coolie map', path.toSystem(coolieMapPath));
        debug.error('write coolie map', err.message);
        return process.exit(1);
    }
};


