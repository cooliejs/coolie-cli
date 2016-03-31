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
var file = path.join(__dirname, '../../example/src/html/index.html');

var srcDirname = path.join(__dirname, '../../example/src/');
var srcCoolieConfigBaseDirname = path.join(srcDirname, 'static/js/app/');
var srcMainPath = path.join(srcCoolieConfigBaseDirname, 'index.js');
var destDirname = path.join(__dirname, '../../example/dest/');
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
            replaceHTMLAttrResource: true,
            replaceHTMLTagScriptCoolie: true,
            replaceHTMLTagScriptAttr: true,
            replaceHTMLTagScriptContent: true,
            replaceHTMLTagStyleResource: true,
            replaceHTMLAttrStyleResource: true,
            replaceHTMLCoolieGroup: true,
            removeHTMLYUIComments: true,
            removeHTMLLineComments: true,
            joinHTMLSpaces: true,
            removeHTMLBreakLines: true,
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





