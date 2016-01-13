/**
 * 前置控制器
 * @author ydr.me
 * @create 2016-01-13 15:12
 */


'use strict';

var midParser = require('../middlewares/parser.js');
var midSafe = require('../middlewares/safe.js');
var midURL = require('../middlewares/url.js');

module.exports = function (app) {
    app.use(midParser.parseCookie);
    app.use(midParser.parseSession);
    app.use(midParser.parsePostBodyOfJSON);
    app.use(midParser.parsePostBodyOfURLencoded);
    app.use(midSafe.mustHasHeaderHost);
    app.use(midSafe.addFrameOptionsHeader);
    app.use(midSafe.addUACompatibleHeader);
    app.use(midParser.parseUA);
    app.use(midURL.strictRouting);
    app.use(midURL.fullUrl);
};


