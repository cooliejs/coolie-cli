/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-28 11:24
 */


'use strict';

var path = require('blear.node.path');
var assert = require('assert');

var parseCoolieConfig = require('../../src/parse/coolie.config.js');

var srcDirname = path.join(__dirname, 'src/');

describe('parse/coolie.config.js', function () {
    it('e', function () {
        var ret = parseCoolieConfig({
            srcDirname: srcDirname,
            configFile: 'coolie.config.js'
        });

        //console.log(JSON.stringify(ret, null, 4));
        assert.equal(path.isDirectory(ret.destDirname), true);
    });
});


