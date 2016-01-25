"use strict";

var fs = require('fs');

module.exports = function (coolie) {
    coolie.config({
        clean: true,
        "js": {
            "main": [
                "./static/js/app/**/*.js"
            ],
            "coolie-config.js": "./static/js/coolie-config.js",
            "dest": "./static/js/",
            "chunk": [
                //[
                //    "./static/js/libs1/**" // => 0
                //],
                //"./static/js/libs2/**"    // => 1
            ]
        },
        "html": {
            "src": [
                "./html/**/*.html"
            ],
            "minify": true
        },
        "css": {
            "dest": "./static/css/",
            "minify": {
                "compatibility": "ie7"
            }
        },
        "resource": {
            "dest": "./static/res/",
            "minify": true
        },
        "copy": [],
        "dest": {
            "dirname": "../dest/",
            "host": "/",
            "versionLength": 8
        }
    });

    coolie.use(require('/Users/cloudcome/development/github/coolie-html-embed-php/index.js')());
};