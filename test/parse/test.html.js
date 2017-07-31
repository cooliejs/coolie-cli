/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-12 14:55
 */


'use strict';


var path = require('ydr-utils').path;
var fs = require('fs');
var expect = require('chai-jasmine').expect;

var matchHTML = require('../../src/parse/html.js');


var file1 = path.join(__dirname, 'test-1.html');
var html1 = fs.readFileSync(file1, 'utf8');

var file2 = path.join(__dirname, 'test-2.html');
var html2 = fs.readFileSync(file2, 'utf8');

var file3 = path.join(__dirname, 'test-3.html');
var html3 = fs.readFileSync(file3, 'utf8');

describe('parse/html.js', function () {
    it('parseHTML', function () {
        var ret = matchHTML(html1)
            .match({
                tag: 'body'
            }, function (node) {
                node.attrs.abc = 123;
                node.attrs.class = 'abc';
                node.attrs.coolieignore = false;
                return node;
            })
            .match({
                tag: 'p'
            }, function (node) {
                node.attrs.class = 'abc';
                return node;
            })
            .match({
                tag: 'link',
                attrs: {
                    type: 'image/x-icon'
                }
            }, function (node) {
                node.attrs.class = 'favicon';
                return node;
            })
            .match({
                tag: ['body', 'p'],
                attrs: {
                    class: /abc/
                }
            }, function (node) {
                node.attrs.time = Date.now();
                return node;
            })
            .exec();

        console.log('----------------------------------------------');
        console.log(ret);
    });

    it('matchHTML > nest', function () {
        var list = [];
        var ret = matchHTML(html2)
            .match({
                tag: 'div',
                nest: true
            }, function (node) {
                list.push(node);
                console.log(node);
                return node;
            })
            .exec();

        expect(list.length).toBe(2);
        expect(list[0].content).toBe('');
        expect(list[1].content).toBe('');
        expect(list[0].source).toBe('<div class="a1">');
        expect(list[1].source).toBe('<div class="b1">');
        expect(ret).toBe(html2);
    });

    it('matchHTML > !nest', function () {
        var list = [];
        var ret = matchHTML(html3)
            .match({
                tag: 'script',
                nest: false
            }, function (node) {
                list.push(node);
                console.log(node);
                return node;
            })
            .exec();

        expect(list.length).toBe(2);
        expect(list[0].content).toBe('1');
        expect(list[1].content).toBe('2');
        expect(list[0].source).toBe('<script 1>1</script>');
        expect(list[1].source).toBe('<script 2>2</script>');
        expect(ret).toBe(html3);
    });
});



