/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-12 23:42
 */


'use strict';

var path = require('blear.node.path');

var coolie = require('../index');

describe('index.js', function () {
    it('parseRequire', function () {
        var ret = coolie.parseRequire(
            path.join(__dirname, 'index-store/main.js'),
            {
                nodeModulesDirname: path.join(__dirname, 'index-store/node-modules')
            }
        );

        console.log(ret);
    });
});


