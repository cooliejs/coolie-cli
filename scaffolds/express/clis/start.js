/**
 * 启动文件
 * @author ydr.me
 * @create 2016年01月13日14:27:23
 */


'use strict';


var fs = require('fs');
var path = require('path');
var util = require('util');
var childProcess = require('child_process');

var pkg = require('../package.json');
var pm2 = require('../pm2.json');
var configs = require('../configs.js');

var startTime = Date.now();
var NPM_REGISTRY = 'http://registry.npm.taobao.org';
var ROOT = path.join(__dirname, '../');
var WEBROOT_DEV = path.join(ROOT, 'webroot-dev');
var isDebug = process.argv[2] === '--debug';


/**
 * 包装器
 * @param color
 * @param args
 */
var wrapper = function (color, args) {
    var str = util.format.apply(util, args);

    str = util.format('\x1b[' + util.inspect.colors[color][0] + 'm%s\x1b[' + util.inspect.colors[color][1] + 'm\n', str);
    process.stdout.write(str);
};


/**
 * 打印 danger 消息
 * @returns {*}
 */
var logDanger = function () {
    wrapper('red', arguments);
};


/**
 * 打印 success 消息
 * @returns {*}
 */
var logSuccess = function (msg) {
    wrapper('green', arguments);
};


/**
 * 打印 warning 消息
 * @returns {*}
 */
var logWarning = function (msg) {
    wrapper('yellow', arguments);
};


/**
 * 打印普通消息
 * @returns {*}
 */
var logNormal = function () {
    return process.stdout.write(util.format.apply(util, arguments) + '\n');
};


/**
 * 执行系统命令
 * @param cmds {Array|String} 命令数组
 * @param [callback] {Function} 执行完毕回调
 */
var exec = function (cmds, callback) {
    cmds = typeof(cmds) === 'string' ? [cmds] : cmds;
    var command = cmds.join(' && ');
    logNormal(command);

    var point = 1;
    process.stdout.write('.');
    var interval = setInterval(function () {
        try {
            process.stdout.cursorTo(point);
        } catch (err) {
            // ignore
        }
        process.stdout.write('.');
        point++;
    }, 1000);

    childProcess.exec(command, function (err, stdout, stderr) {
        clearInterval(interval);
        try {
            process.stdout.clearLine();
        } catch (err) {
            // ignore
        }
        process.stdout.write('\n');

        if (err) {
            logDanger(err.message);
            return process.exit(1);
        }

        if (stderr) {
            logWarning(stderr);
        }

        logSuccess(stdout);
        callback();
    });
};


/**
 * 输出当前时间字符串
 * @returns {string}
 */
var now = function () {
    var d = new Date();
    var fix = function (n) {
        return (n < 10 ? '0' : '') + n;
    };

    return ''.concat(
        fix(d.getFullYear()),
        '-',
        fix(d.getMonth() + 1),
        '-',
        fix(d.getDate()),
        ' ',
        fix(d.getHours()),
        ':',
        fix(d.getMinutes()),
        ':',
        fix(d.getSeconds()),
        '.',
        fix(d.getMilliseconds())
    );
};


/**
 * 路径是否为文件夹
 * @param _path
 * @returns {*}
 */
var isDirectory = function (_path) {
    var stat;

    try {
        stat = fs.statSync(_path);
    } catch (err) {
        return false;
    }

    return stat.isDirectory();
};


// 更新代码
var gitPull = function (callback) {
    logNormal('\n\n───────────[ 1/4 ]───────────');

    if (!isDirectory(path.join(ROOT, '.git'))) {
        logWarning('fatal: Not a git repository (or any of the parent directories): .git');
        return callback();
    }

    exec([
        'cd ' + ROOT,
        'git branch',
        'git pull' + (configs.env === 'local' ? '' : ' -f')
    ], function () {
        logSuccess('git pull success');
        callback();
    });
};


// 更新后端模块
var installNodeModules = function (callback) {
    logNormal('\n\n───────────[ 2/4 ]───────────');
    exec([
        'cd ' + ROOT,
        'npm update --registry=' + NPM_REGISTRY
    ], function () {
        logSuccess('update node modules success');
        callback();
    });
};


// 更新前端模块
var installFrontModules = function (callback) {
    logNormal('\n\n───────────[ 3/4 ]───────────');

    if (configs.env !== 'local') {
        logNormal('ignore front modules');
        return callback();
    }

    exec([
        'cd ' + WEBROOT_DEV,
        'npm update --registry=' + NPM_REGISTRY,
        'cd ' + ROOT
    ], function () {
        logSuccess('update front modules success');
        callback();
    });
};


// 本地启动
var startLocal = function (callback) {
    var supervisor = require('supervisor');
    var args = [];

    args.push(__filename);
    args.push('-w');
    args.push('./webserver/');
    args.push('-e');
    args.push('js,md');
    args.push('app.js');

    supervisor.run(args);
    callback();
};


// debug 启动
var startDebug = function (callback) {
    require('../app.js');
    callback();
};


// pm2 启动
var startPM2 = function (callback) {
    exec([
        'pm2 start pm2.json',
        'pm2 show ' + pm2.name
    ], callback);
};


// 启动
var start = function () {
    logNormal('\n\n───────────[ 4/4 ]───────────');

    var done = function () {
        logNormal('');
        logSuccess('past ' + (Date.now() - startTime) + 'ms');
        logNormal('');
    };

    if (isDebug) {
        startDebug(function () {
            logSuccess('debug start success');
            done();
        });
    } else if (configs.env === 'local') {
        startLocal(function () {
            logSuccess('listen changing success');
            done();
        });
    } else {
        startPM2(function () {
            logSuccess('pm2 start success');
            done();
        });
    }
};


var banner = function () {
    var list = [];
    var padding = 4;

    list.push('start time         │ ' + now());
    list.push('nodejs version     │ ' + process.versions.node);
    list.push('nodejs environment │ ' + configs.env);
    list.push('nodejs project     │ ' + pkg.name + '@' + pkg.version);
    list.push('project home       │ ' + ROOT);

    var maxLength = 0;
    list.forEach(function (item) {
        if (item.length > maxLength) {
            maxLength = item.length;
        }
    });

    maxLength += padding;

    var fixed = function (str, maxLength, padding) {
        return str + new Array(maxLength - str.length).join(padding);
    };

    var theadLeft = '┌────────────────────┬';
    var tfootLeft = '└────────────────────┴';
    var thead = fixed(theadLeft, maxLength + padding - 2, '─') + '┐';
    var tfoot = fixed(tfootLeft, maxLength + padding - 2, '─') + '┘';

    logWarning(thead);
    list.forEach(function (item) {
        logWarning('│ ' + fixed(item, maxLength, ' ') + '│');
    });
    logWarning(tfoot);
};


banner();

// 更新代码安装模块并启动
gitPull(function () {
    installNodeModules(function () {
        installFrontModules(function () {
            start();
        });
    });
});
