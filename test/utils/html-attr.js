/**
 * 文件描述
 * @author ydr.me
 * @create 2015-10-22 16:17
 */


'use strict';

var assert = require('assert');

var htmlAttr = require('../../utils/html-attr.js');


describe('utils/html-attr.js', function () {
    it('htmlAttr.get', function () {
        var html = '<p abc="abc" def ghi="<mno>">';

        var abc = htmlAttr.get(html, 'abc');
        var def = htmlAttr.get(html, 'def');
        var ghi = htmlAttr.get(html, 'ghi');
        var mno = htmlAttr.get(html, 'mno');

        assert.equal(abc, 'abc');
        assert.equal(def, true);
        assert.equal(ghi, '<mno>');
        assert.equal(mno, false);
    });

    it('htmlAtt.set', function () {
        var html = '<p abc="abc" def ghi="<mno>">';

        html = htmlAttr.set(html, 'abc', true);
        html = htmlAttr.set(html, 'def', '123');
        assert.equal(htmlAttr.get(html, 'abc'), 'true');
        assert.equal(htmlAttr.get(html, 'def'), '123');
    });

    it('htmlAttr.remove', function () {
        var html = '<p abc="abc" def ghi="<mno>">';

        html = htmlAttr.remove(html, 'abc');
        html = htmlAttr.remove(html, 'def');
        assert.equal(htmlAttr.get(html, 'abc'), false);
        assert.equal(htmlAttr.get(html, 'def'), false);
    });
});








