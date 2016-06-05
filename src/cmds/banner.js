/**
 * banner
 * @author ydr.me
 * @create 2015-10-31 20:35
 */



'use strict';

var debug = require('blear.node.debug');
var console = require('blear.node.console');


var pkg = require('../../package.json');


var blank = function (length) {
    return new Array(length).join(' ');
};

module.exports = function () {
    console.log();
    console.log(
        console.colors.original(blank(11)),
        console.colors.original(blank(11)),
        console.colors.original(blank(12)),
        console.colors.green('oooo'),
        console.colors.original(blank(3)),
        console.colors.magenta('o8o'),
        console.colors.original(blank(12))
    );
    console.log(
        console.colors.original(blank(34)),
        console.colors.green('`888'),
        console.colors.original(blank(3)),
        console.colors.magenta('`"\'')
    );
    console.log(
        console.colors.original(blank(2)),
        console.colors.red('.ooooo.'),
        console.colors.original(blank(3)),
        console.colors.yellow('.ooooo.'),
        console.colors.original(blank(3)),
        console.colors.cyan('.ooooo.'),
        console.colors.original(blank(3)),
        console.colors.green('888'),
        console.colors.original(blank(2)),
        console.colors.magenta('oooo'),
        console.colors.original(blank(3)),
        console.colors.blue('.ooooo.')
    );
    console.log(
        console.colors.original(blank(1)),
        console.colors.red('d88\' `"Y8'),
        console.colors.original(blank(1)),
        console.colors.yellow('d88\' `88b'),
        console.colors.original(blank(1)),
        console.colors.cyan('d88\' `88b'),
        console.colors.original(blank(2)),
        console.colors.green('888'),
        console.colors.original(blank(2)),
        console.colors.magenta('`888'),
        console.colors.original(blank(2)),
        console.colors.blue('d88\' `88b')
    );
    console.log(
        console.colors.original(blank(1)),
        console.colors.red('888'),
        console.colors.original(blank(7)),
        console.colors.yellow('888   888'),
        console.colors.original(blank(1)),
        console.colors.cyan('888   888'),
        console.colors.original(blank(2)),
        console.colors.green('888'),
        console.colors.original(blank(3)),
        console.colors.magenta('888'),
        console.colors.original(blank(2)),
        console.colors.blue('888ooo888')
    );
    console.log(
        console.colors.original(blank(1)),
        console.colors.red('888   .o8'),
        console.colors.original(blank(1)),
        console.colors.yellow('888   888'),
        console.colors.original(blank(1)),
        console.colors.cyan('888   888'),
        console.colors.original(blank(2)),
        console.colors.green('888'),
        console.colors.original(blank(3)),
        console.colors.magenta('888'),
        console.colors.original(blank(2)),
        console.colors.blue('888    .o')
    );
    console.log(
        console.colors.original(blank(1)),
        console.colors.red('`Y8bod8P\''),
        console.colors.original(blank(1)),
        console.colors.yellow('`Y8bod8P\''),
        console.colors.original(blank(1)),
        console.colors.cyan('`Y8bod8P\''),
        console.colors.original(blank(1)),
        console.colors.green('o888o'),
        console.colors.original(blank(1)),
        console.colors.magenta('o888o'),
        console.colors.original(blank(1)),
        console.colors.blue('`Y8bod8P\''),
        console.colors.original(blank(2)),
        console.colors.bgRed(' ' + pkg.version + ' ')
    );
    console.log();
    console.log(
        console.colors.original(blank(1)),
        console.colors.grey(new Array(20).join('━')),
        console.colors.original(blank(1)),
        console.colors.original(pkg.description),
        console.colors.grey(new Array(20).join('━')),
        console.colors.original(blank(1))
    );
    console.log();
};
