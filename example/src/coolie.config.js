"use strict";

module.exports = function (coolie) {
    coolie.config({
        clean: true,
        "js": {
            "main": [
                //"/static/js/app/example-index.js",
                //"/static/js/app/res.js",
                //"/static/js/app/webuploader.js",
                //"/static/js/app/async.js",
                //"/static/js/app/async-2.js",
            ],
            //"coolie-config.js": "./static/js/coolie-config.js",
            "coolie-config.js": null,
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
                //"./html/async.html",
                //"./html/async-2.html",
                //"./html/123.html",
                //"./html/888.html",
                "./html/012.html",
                //"./html/456.html",
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
            "host": function (type, path) {
                if (/\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(path)) {
                    return 'http://img.cdn.com';
                }

                return {
                    res: 'http://res.cdn.com',
                    css: 'http://css.cdn.com',
                    js: 'http://js.cdn.com'
                }[type];
            },
            "versionLength": 8
        }
    });

    //if (process.env.NODE_ENV === 'local') {
    //    console.log('------------------------------------');
    //    console.log('[coolie.config.js]', 'local mode');
    //    coolie.use(require('/Users/cloudcome/development/github/coolie-html-tag-template/index.js')());
    //    coolie.use(require('/Users/cloudcome/development/github/coolie-html-embed-php/index.js')());
    //    coolie.use(require('/Users/cloudcome/development/github/coolie-html-attr-resource/index.js')());
    //}
};