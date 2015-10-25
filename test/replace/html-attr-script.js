/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-22 18:56
 */


'use strict';

var path = require('path');
var fs = require('fs');
var assert = require('assert');

var replaceHTMLAttrScript = require('../../replace/html-attr-script.js');
var file = path.join(__dirname, '../../example/src/html/replace.html');

var code = fs.readFileSync(file, 'utf8');
var srcDirname = path.join(__dirname, '../../example/src/');
var destDirname = path.join(__dirname, '../../example/dest/');
var destCoolieConfigJSURI = 'static/js/eb21eac7c7c8278c7bf0c208efbfd663.js';
var destCoolieConfigJSPath = path.join(destDirname, destCoolieConfigJSURI);
var srcCoolieConfigBaseDirname = path.join(srcDirname, 'static/js/app/');
var srcMainPath = path.join(srcDirname, 'static/js/app/index.js');
var versionMap = {};

versionMap[srcMainPath] = '00023123123123123312312';

describe('replace/html-attr-script.js', function () {
    it('e', function () {
        var ret = replaceHTMLAttrScript(file, {
            code: code,
            srcDirname: srcDirname,
            srcCoolieConfigBaseDirname: srcCoolieConfigBaseDirname,
            destDirname: destDirname,
            versionMap: versionMap,
            destHost: 'http://abc.com',
            destCoolieConfigJSPath: destCoolieConfigJSPath
        });
        var expect1 = '<script src="/static/js/coolie.min.js" data-config="http://abc.com/' +
            destCoolieConfigJSURI + '" data-main="./' + versionMap[srcMainPath] + '.js" ></script>';

        assert.equal(ret.indexOf(expect1) > -1, true);
    });
});



