"use strict";

var string = require('ydr-utils').string;
var linkRelList = [
    'apple-touch-icon',
    'apple-touch-icon-precomposed',
    'apple-touch-startup-image',
    'icon',
    'shortcut icon',
    'og:image',
    'msapplication-TileImage'
];

var reg = new RegExp('<(:?link)\\b[\\s\\S]*?rel\\s*?=\\s*?(["\'])(:?' + string.escapeRegExp(linkRelList.join('|')) + ')\\1', 'gi')

console.log(reg);

