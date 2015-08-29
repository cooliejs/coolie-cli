'use strict';

var bcm = require('../build/build-css-module.js');
var path = require('path');
var file = path.join(__dirname, '../example/src/static/js/libs2/some.css');
var opt = bcm(file, 'css');

console.log(opt);

