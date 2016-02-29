"use strict";

var fs = require('fs');

module.exports = function (coolie) {
    coolie.config({
        clean: true,
        "js": {
            "main": [
                //"/static/js/app/res.js",
                //"/static/js/app/webuploader.js",
                "/static/js/app/async.js",
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
                "./html/123.html",
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
        "copy": [
            //"static/fonts/tinymce.woff"
        ],
        "dest": {
            "dirname": "../dest/",
            "host": "/",
            "versionLength": 8
        }
    });

    if (process.env.NODE_ENV === 'local') {
        console.log('------------------------------------');
        console.log('[coolie.config.js]', 'local mode');
        coolie.use(require('/Users/cloudcome/development/github/coolie-html-tag-template/index.js')());
        coolie.use(require('/Users/cloudcome/development/github/coolie-html-embed-php/index.js')());
        coolie.use(require('/Users/cloudcome/development/github/coolie-html-attr-resource/index.js')());
    }
};