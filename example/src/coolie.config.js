"use strict";

module.exports = function (coolie) {
    coolie.config({
        clean: true,
        "js": {
            "main": [
                "/static/js/app/012.js",
                "/static/js/app/example-index.js",
                "/static/js/app/res.js",
                "/static/js/app/webuploader.js",
                "/static/js/app/async.js",
                "/static/js/app/async-2.js",
            ],
            "coolie-config.js": "./static/js/coolie-config.js",
            "dest": "./static/js/",
            "chunk": [
                //[
                //    "./static/js/libs1/**" // => 0
                //],
                //"./static/js/libs2/**"    // => 1
            ],
            "minify": {
                global_defs: {
                    DEBUG: false,
                    CLASSICAL: false
                }
            }
        },
        "html": {
            "src": [
                //"./html/async.html",
                //"./html/async-2.html",
                //"./html/123.html",
                //"./html/888.html",
                "./html/012.html",
                //"./html/comments.html",
                //"./html/wordpress.html",
                //"./html/456.html",
            ],
            "minify": true
        },
        "css": {
            "dest": "./static/css/",
            "minify": true
        },
        "resource": {
            "dest": "./static/res/",
            "minify": false
        },
        "copy": [
            //"static/fonts/tinymce.woff"
        ],
        "dest": {
            "dirname": "../dest/",
            "host": function (type, path) {
                return '/';
                //if (/\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(path)) {
                //    return 'http://img.cdn.com';
                //}
                //
                //return {
                //    res: 'http://res.cdn.com',
                //    css: 'http://css.cdn.com',
                //    js: 'http://js.cdn.com'
                //}[type];
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

    //coolie.use(function (options) {
    //    if(options.progress !== 'pre-html'){
    //        return options;
    //    }
    //
    //    options.code = options.code.replace(/<\?php wordpress_wp_content_theme_path \?>/g, '');
    //    return options;
    //});
    //
    //coolie.use(function (options) {
    //    if(options.progress !== 'post-html'){
    //        return options;
    //    }
    //
    //    options.code = coolie.matchHTML(options.code, {
    //        tag: 'img'
    //    }, function (node) {
    //        node.attrs.src = '<?php wordpress_wp_content_theme_path ?>' + node.attrs.src;
    //        return node;
    //    });
    //
    //    return options;
    //});
};