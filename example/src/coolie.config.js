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
        }
    });

    coolie.hookReplaceHTML(function (file, meta) {
        var code = meta.code;
        var REG_INCLUDE = /\{\{include (.*?)}}/;
        var matches = null;

        while((matches = code.match(REG_INCLUDE)) !== null){
            console.log(matches);
        }

        //var includeFile = matches[1];
        //includeFile = coolie.pathURI.join(coolie.configs.srcDirname, 'html', includeFile);
        //
        //console.log(includeFile);
        return code;
    });

    coolie.hookReplaceHTMLResource(function (file, meta) {
        var code = meta.code;
        var tagName = meta.tagName;

        if (tagName !== 'img') {
            return;
        }

        var dataOriginal = coolie.htmlAttr.get(code, 'data-original');

        if (!dataOriginal || dataOriginal === true) {
            return code;
        }

        var dataOriginalFile = coolie.pathURI.toAbsolute(dataOriginal, file);
        var toFile = coolie.copy(dataOriginalFile, {
            version: true,
            dest: coolie.configs.destResourceDirname
        });
        var toURI = coolie.pathURI.toRootURL(toFile, coolie.configs.destDirname);

        return coolie.htmlAttr.set(code, 'data-original', toURI);
    });
};