"use strict";


module.exports = function (coolie) {
    coolie.config = {
        "js": {
            "main": [
                "./static/js/app/**.js"
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
                "./html/**"
            ],
            "minify": true,
            hook: function (meta) {

            }
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

        // 挂载构建模块
        hookModule:  function (module) {
            //console.log(module);
        },
        // 挂载构建 HTML
        hookHTML: function (html) {

        }
    };
};