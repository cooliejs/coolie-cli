/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-26 14:40
 */


'use strict';

var path = require('ydr-utils').path;
var assert = require('assert');

var pathURI = require('../../utils/path-uri.js');

describe('utils/path-uri.js', function () {
    it('.toRootURL', function () {
        var p = path.join(__dirname, 'a/b.js');
        var ret = pathURI.toRootURL(p, __dirname);
        var expect = '/a/b.js';

        assert.equal(ret, expect);
    });

    it('.isRelatived', function () {
        var ret1 = pathURI.isRelatived('a/b.js');
        var ret2 = pathURI.isRelatived('http://abc.om/a/b.js');

        assert.equal(ret1, true);
        assert.equal(ret2, false);
    });

    it('.isRelativeFile', function () {
        var ret1 = pathURI.isRelativeFile('a/b.js');
        var ret2 = pathURI.isRelativeFile('http://abc.om/a/b.js');
        var ret3 = pathURI.isRelativeFile('../a/b.js');
        var ret4 = pathURI.isRelativeFile('./a/b.js');
        var ret5 = pathURI.isRelativeFile('/a/b.js');

        assert.equal(ret1, true);
        assert.equal(ret2, false);
        assert.equal(ret3, true);
        assert.equal(ret4, true);
        assert.equal(ret5, false);
    });

    it('.isRelativeRoot', function () {
        var ret1 = pathURI.isRelativeRoot('a/b.js');
        var ret2 = pathURI.isRelativeRoot('http://abc.om/a/b.js');
        var ret3 = pathURI.isRelativeRoot('../a/b.js');
        var ret4 = pathURI.isRelativeRoot('./a/b.js');
        var ret5 = pathURI.isRelativeRoot('/a/b.js');

        assert.equal(ret1, false);
        assert.equal(ret2, false);
        assert.equal(ret3, false);
        assert.equal(ret4, false);
        assert.equal(ret5, true);
    });

    it('.toAbsoluteFile', function () {
        var parentFile = __filename;
        var rootDirname = __dirname;
        var name1 = 'a/b.js';
        var ret1 = pathURI.toAbsoluteFile(name1, parentFile, rootDirname);
        var exp1 = path.join(path.dirname(parentFile), name1);

        assert.equal(ret1, exp1);

        var name2 = './a/b.js';
        var ret2 = pathURI.toAbsoluteFile(name2, parentFile, rootDirname);
        var exp2 = path.join(path.dirname(parentFile), name2);

        assert.equal(ret2, exp2);

        var name3 = '../a/b.js';
        var ret3 = pathURI.toAbsoluteFile(name3, parentFile, rootDirname);
        var exp3 = path.join(path.dirname(parentFile), name3);

        assert.equal(ret3, exp3);

        var name4 = '/a/b.js';
        var ret4 = pathURI.toAbsoluteFile(name4, parentFile, rootDirname);
        var exp4 = path.join(rootDirname, name4);

        assert.equal(ret4, exp4);
    });

    it('.isImage', function () {
        var ret1 = pathURI.isImage('a.png');
        var ret2 = pathURI.isImage('a.png1');

        assert.equal(ret1, true);
        assert.equal(ret2, false);
    });

    it('.isBlank', function () {
        var ret1 = pathURI.isBlank('a.png');
        var ret2 = pathURI.isBlank('data:text/plain;base64,');
        var ret3 = pathURI.isBlank('about:blank');

        assert.equal(ret1, false);
        assert.equal(ret2, true);
        assert.equal(ret3, true);
    });

    it('.isURL', function () {
        var ret1 = pathURI.isURL('a.png');
        var ret2 = pathURI.isURL('data:text/plain;base64,');
        var ret3 = pathURI.isURL('http://dqwdqw');
        var ret4 = pathURI.isURL('https://dqwdqw');
        var ret5 = pathURI.isURL('ftp://dqwdqw');
        var ret6 = pathURI.isURL('ftps://dqwdqw');
        var ret7 = pathURI.isURL('//dqwdqw');

        assert.equal(ret1, false);
        assert.equal(ret2, true);
        assert.equal(ret3, true);
        assert.equal(ret4, true);
        assert.equal(ret5, true);
        assert.equal(ret6, true);
        assert.equal(ret7, true);
    });

    it('.joinURL', function () {
        var ret1 = pathURI.joinURI('/a', '/b');
        var ret2 = pathURI.joinURI('/a/b/c', '../d');

        assert.equal(ret1, '/a/b');
        assert.equal(ret2, '/a/b/d');
    });

    it('.parseURI2Path', function () {
        var ret = pathURI.parseURI2Path('/a/b/c/d/?x=1&y=2&z=3#!/m=n=q');

        assert.equal(ret.path, '/a/b/c/d/');
        assert.equal(ret.suffix, '?x=1&y=2&z=3#!/m=n=q');
        assert.equal(ret.original, '/a/b/c/d/?x=1&y=2&z=3#!/m=n=q');
        assert.equal(ret.extname, '');
        assert.equal(ret.basename, 'd');
    });

    it('.replaceVersion', function () {
        var ret = pathURI.replaceVersion('a.js', 'xxxx');

        assert.equal(ret, 'xxxx.js');
    });

    it('.removeVersion', function () {
        var ret = pathURI.removeVersion('a.xxxx.js');

        assert.equal(ret, 'a.js');
    });
});
