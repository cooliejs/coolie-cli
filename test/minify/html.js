/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-22 17:21
 */


'use strict';

var path = require('path');
var fs = require('fs');
var assert = require('assert');

var minifyHTML = require('../../minify/html.js');
var file = path.join(__dirname, '../../example/src/html/index.html');

var srcDirname = path.join(__dirname, '../../example/src/');
var srcCoolieConfigBaseDirname = path.join(srcDirname, 'static/js/app/');
var srcMainPath = path.join(srcCoolieConfigBaseDirname, 'index.js');
var destCoolieConfigJSPath = path.join(srcDirname, 'static/js/dwdqwdqwdqwdqwdqwdqw312.js');
var destDirname = path.join(__dirname, '../../example/dest/');
var destResourceDirname = path.join(destDirname, 'static/res/');
var destCSSDirname = path.join(destDirname, 'static/css/');
var mainVersionMap = {};

describe('minify/html.js', function () {
    it('e', function () {
        mainVersionMap[srcMainPath] = 'abcdef123123kdgqoiwdqw';
        var code = fs.readFileSync(file, 'utf8');
        var ret = minifyHTML(file, {
            code: code,
            srcDirname: srcDirname,
            destDirname: destDirname,
            destHost: '/',
            destResourceDirname: destResourceDirname,
            srcCoolieConfigBaseDirname: srcCoolieConfigBaseDirname,
            destCoolieConfigJSPath: destCoolieConfigJSPath,
            destCSSDirname: destCSSDirname,
            replaceHTMLAttrResource: true,
            replaceHTMLTagScript: true,
            replaceHTMLTagStyleResource: true,
            replaceHTMLAttrStyleResource: true,
            replaceHTMLCoolieGroup: true,
            minifyJS: true,
            minifyCSS: true,
            replaceCSSResource: true,
            mainVersionMap: mainVersionMap
        });

        console.log(ret);
        assert.equal(/\/static\/res\/[a-z\d]{32}?\./.test(ret), true);
        assert.equal(/\/static\/css\/[a-z\d]{32}?\./.test(ret), true);
        assert.equal(ret.indexOf('~/static/js/dwdqwdqwdqwdqwdqwdqw312.js') > -1, true);
    });
});





