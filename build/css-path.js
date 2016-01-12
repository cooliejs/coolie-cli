/**
 * 文件描述
 * @author ydr.me
 * @create 2016-01-12 16:59
 */


'use strict';


var pathURI = require('../utils/path-uri.js');

module.exports = function (href, options) {

    var srcPath = pathURI.toAbsoluteFile(href, file, options.srcDirname);
    var destPath = minifyPathmap[srcPath];
    var destURI = minifyCSSmap[srcPath];
    resList = resourceMap[srcPath];

    if (!destURI) {
        var srcCode = reader(srcPath, 'utf8');
        var destCode = srcCode;

        if (options.minifyCSS) {
            var minifyCSSRet = minifyCSS(srcPath, {
                code: srcCode,
                cleanCSSOptions: options.cleanCSSOptions,
                versionLength: options.versionLength,
                srcDirname: options.srcDirname,
                destDirname: options.destDirname,
                destHost: options.destHost,
                destResourceDirname: options.destResourceDirname,
                minifyResource: options.minifyResource,
                replaceCSSResource: true
            });
            destCode = minifyCSSRet.code;
            resList = minifyCSSRet.resList;
        }

        var destVersion = encryption.md5(destCode).slice(0, options.versionLength);

        destPath = path.join(options.destCSSDirname, destVersion + '.css');
        destURI = pathURI.toRootURL(destPath, options.destDirname);
        destURI = pathURI.joinURI(options.destHost, destURI);

        if (options.signCSS) {
            destCode = sign('css') + '\n' + destCode;
        }

        try {
            fse.outputFileSync(destPath, destCode, 'utf8');
            minifyPathmap[srcPath] = destPath;
            minifyCSSmap[srcPath] = destURI;
            resourceMap[srcPath] = resList;
            debug.success('√', pathURI.toRootURL(srcPath, options.srcDirname));
        } catch (err) {
            debug.error('write file', path.toSystem(destPath));
            debug.error('write file', err.message);
            return process.exit(1);
        }
    }

    cssList.push({
        destPath: destPath,
        dependencies: [{
            srcPath: srcPath,
            resList: resList
        }]
    });

    node.attrs.href = destURI;
};


