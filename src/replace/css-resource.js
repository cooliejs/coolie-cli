/**
 * css 引用资源替换
 * @author ydr.me
 * @create 2015-10-22 16:02
 */


'use strict';


var path = require('ydr-utils').path;
var debug = require('ydr-utils').debug;
var dato = require('ydr-utils').dato;

var pathURI = require('../utils/path-uri.js');
var base64 = require('../utils/base64.js');
var copy = require('../utils/copy.js');
var buildResPath = require('../build/res-path.js');

// background: url("...");
var REG_URL = /url\s*?\((.*?)\)/ig;
// _filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(src="...");
var REG_SRC = /\(src\s*?=\s*?(.*?)\)/;
var REG_QUOTE = /^["']|['"]$/g;
var regs = [{
    before: 'url(',
    reg: REG_URL,
    after: ')',
    quote: false
}, {
    before: '(src=',
    reg: REG_SRC,
    after: ')',
    quote: true
}];
var defaults = {
    code: '',
    versionLength: 32,
    srcDirname: null,
    destDirname: null,
    destHost: '/',
    destResourceDirname: null,
    destCSSDirname: null,
    minifyResource: true,
    mute: false
};


/**
 * 构建 css 资源版本，建议在 css minify 之后处理
 * @param file {String} 待替换的文件
 * @param options {Object} 配置
 * @param options.code {String} 代码
 * @param options.versionLength {Number} 版本长度
 * @param options.srcDirname {String} 构建工程原始根目录
 * @param options.destDirname {String} 目标根目录
 * @param options.destHost {String} 目标文件 URL 域
 * @param options.destResourceDirname {String} 目标资源文件保存目录
 * @param options.mute {Boolean} 是否静音
 * @param [options.destCSSDirname] {String} 目标样式文件目录，如果存在，则资源相对路径
 * @param [options.minifyResource] {Boolean} 压缩资源文件
 * @returns {Object}
 */
module.exports = function (file, options) {
    options = dato.extend({}, defaults, options);
    var deps = [];
    var depsMap = {};
    var code = options.code;

    regs.forEach(function (item) {
        code = code.replace(item.reg, function (all, resource) {
            var quote = resource[0];

            quote = quote === "'" || quote === '"' ? quote : '';
            quote = item.quote ? quote : '';
            resource = resource.replace(REG_QUOTE, '');

            var pathRet = pathURI.parseURI2Path(resource);
            var ret = buildResPath(resource, {
                file: file,
                versionLength: options.versionLength,
                srcDirname: options.srcDirname,
                destDirname: options.destDirname,
                destResourceDirname: options.destResourceDirname,
                destHost: options.destHost,
                mute: options.mute,
                base64: pathRet.coolieBase64
            });

            if (!ret) {
                return all;
            }

            var srcFile = ret.srcFile;
            var destFile = ret.destFile;

            if (!depsMap[srcFile]) {
                depsMap[srcFile] = true;
                deps.push(srcFile);
            }

            if (pathRet.coolieBase64) {
                return item.before + quote + ret.url + quote + item.after;
            }

            var url = ret.url;

            // 有目标文件，css 里的资源相对于 css 文件本身
            if (options.destCSSDirname) {
                url = path.relative(options.destCSSDirname, destFile);
            }

            url = path.toURI(url) + pathRet.suffix;

            return item.before + url + item.after;
        });
    });

    return {
        code: code,
        resList: deps
    };
};





