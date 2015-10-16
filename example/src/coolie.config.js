"use strict";


module.exports = function (coolie) {
    coolie.config({
        "js": {
            "main": [
                //"./static/js/app/**.js"
            ],
            "coolie-config.js": "./static/js/coolie-config.js",
            "dest": "./static/js/",
            "chunk": [
                [
                    "./static/js/libs1/**"
                ],
                "./static/js/libs2/**"
            ]
        },
        "html": {
            "src": [
                //"./html/**"
                "./html/replace.html"
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
            "host": "",
            "versionLength": 8
        },

        // 挂载构建 HTML
        hookReaplceHTML: function (file, code) {
        },

        hookReplaceHTMLResource: function (file, tag) {
            var href = coolie.htmlAttr.get(tag, 'href');
            coolie.copy(file);
        }
    });
};