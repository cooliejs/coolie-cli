/*!
 * 文件描述
 * @author ydr.me
 * @create 2015-08-12 09:24
 */


'use strict';


var string = require('ydr-utils').string;
var pkg = require('../package.json');
var log = require("../libs/log.js");
var cmdConfig = require("./config.js");
var cmdJSON = require("./json.js");
var cmdBuild = require("./build.js");
var cmdVersion = require("./version.js");
var cmdBook = require("./book.js");
var cmdPull = require("./pull.js");
var cmdAlien = require("./alien.js");
var cmdDonkey = require("./donkey.js");
var cmdHelp = require("./help.js");
var path = require("path");
var colors = require('colors/safe.js');
var CWD = process.cwd();
var cmdArgs = process.argv.slice(2);
var cmdArg0 = cmdArgs[0];
var cmdArg1 = cmdArgs[1];
var buildPath = cmdArg1 ? path.join(CWD, cmdArg1) : CWD;


console.log('');
console.log(colors.cyan('╔═════════════════════════════════════════╗'));
console.log(colors.cyan('║  ', 'coolie@' + string.padRight(pkg.version, 8, ' '), '                      ║'));
console.log(colors.cyan('║  ', pkg.description, '   ║'));
console.log(colors.cyan('╚═════════════════════════════════════════╝'));
console.log('');

switch ((cmdArg0 || "").toLowerCase()) {
    case "alien":
        cmdAlien(buildPath);
        break;

    case "book":
        cmdBook();
        break;

    case "build":
        cmdBuild(buildPath);
        break;

    case "config":
        cmdConfig(buildPath);
        break;

    case "donkey":
        cmdDonkey(buildPath);
        break;

    case "json":
        cmdJSON(buildPath);
        break;

    case "pull":
        cmdPull(buildPath);
        break;

    case "-v":
    case "version":
        cmdVersion();
        break;

    case '-h':
        cmdHelp(true);
        break;

    default:
        cmdHelp();
}

