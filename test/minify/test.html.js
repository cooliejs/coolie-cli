/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-22 17:21
 */


'use strict';

var path = require('ydr-utils').path;
var fs = require('fs');
var assert = require('assert');

var minifyHTML = require('../../minify/html.js');

var srcDirname = path.join(__dirname, 'src/');
var file = path.join(srcDirname, 'html.html');
var srcCoolieConfigBaseDirname = path.join(srcDirname, './');
var srcMainPath = path.join(srcCoolieConfigBaseDirname, 'html-main.js');
var destDirname = path.join(__dirname, 'dest/');
var destCoolieConfigJSPath = path.join(destDirname, 'static/js/dwdqwdqwdqwdqwdqwdqw312.js');
var destResourceDirname = path.join(destDirname, 'static/res/');
var destJSDirname = path.join(destDirname, 'static/js/');
var destCSSDirname = path.join(destDirname, 'static/css/');
var mainVersionMap = {};

describe('minify/html.js', function () {
    it('e', function () {
        mainVersionMap[srcMainPath] = 'abcdef123123kdgqoiwdqw';
        var code = fs.readFileSync(file, 'utf8');
        var ret = minifyHTML(file, {
            code: code,
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
        }).code;

        console.log(ret);
        assert.equal(/\/static\/res\/[a-z\d]{32}\./.test(ret), true);
        assert.equal(/\/static\/css\/[a-z\d]{32}\./.test(ret), true);
        assert.equal(ret.indexOf('/static/js/dwdqwdqwdqwdqwdqwdqw312.js') > -1, true);
    });
});





