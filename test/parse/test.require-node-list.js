/**
 * 文件描述
 * @author ydr.me
 * @create 2016-05-29 21:50
 */


'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');


var parseRequireNodeList = require('../../src/parse/require-node-list.js');


var file = path.join(__dirname, './src/require-node-list.js');
var code = fs.readFileSync(file, 'utf8');

describe('require-node-list.js', function () {
    it('main', function () {
        var nodeList = parseRequireNodeList(file, {
            code: code
        });

        assert.equal(nodeList.length, 1);
    });
});

