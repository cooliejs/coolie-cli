/**
 * 文件描述
 * @author ydr.me
 * @create 2018-10-09 10:30
 * @update 2018-10-09 10:30
 */


'use strict';

var parse = require('parse5');
var fs = require('fs');
var path = require('path');

var html = fs.readFileSync(path.join(__dirname, 'html2.html'), 'utf8');

var doc = parse.parseFragment(html);


function walk(node) {
    var tree = [];

    if (!node.childNodes) {
        return tree;
    }

    node.childNodes.forEach(function (node) {
        var tag = {};
        tag[node.nodeName] = {
            attrs: node.attrs,
            childNodes: walk(node),
            value: node.value
        };
        tree.push(tag);
    });
    return tree;
}

var tree = walk(doc);

tree;
