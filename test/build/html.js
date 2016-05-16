/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-29 10:30
 */


'use strict';

var assert = require('assert');
var path = require('ydr-utils').path;

var buildHTML = require('../../build/html.js');

var srcDirname = path.join(__dirname, 'src/');
var srcCoolieConfigBaseDirname = path.join(srcDirname, './');
var destDirname = path.join(__dirname, 'dest/');
var destCoolieConfigJSPath = path.join(destDirname, 'static/js/dwdqwdqwdqwdqwdqwdqw312.js');
var destResourceDirname = path.join(destDirname, 'static/res/');
var destJSDirname = path.join(destDirname, 'static/js/');
var destCSSDirname = path.join(destDirname, 'static/css/');
var mainVersionMap = {};

mainVersionMap[path.join(srcCoolieConfigBaseDirname, 'html.js')] = Math.random().toString(32).slice(2);
describe('build/html.js', function () {
    it('e', function () {
        var ret = buildHTML({
            glob: [
                'html.html'
            ],
            versionLength: 32,
            srcDirname: srcDirname,
            destDirname: destDirname,
            destJSDirname: destJSDirname,
            destCSSDirname: destCSSDirname,
            destResourceDirname: destResourceDirname,
            destHost: '/',
            srcCoolieConfigBaseDirname: srcCoolieConfigBaseDirname,
            destCoolieConfigJSPath: destCoolieConfigJSPath,
            minifyJS: true,
            minifyCSS: true,
            minifyResource: true,
            uglifyJSOptions: null,
            cleanCSSOptions: null,
            replaceCSSResource: true,
            mainVersionMap: mainVersionMap
        });

        console.log(ret);
        assert.equal(ret.htmlList.length > 0, true);
    });
});



