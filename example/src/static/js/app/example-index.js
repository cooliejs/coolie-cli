/**
 * 文件描述
 * @author ydr.me
 * @create 2016-03-22 13:34
 */


define(function (require, exports, module) {
    /**
     * @module parent/example-index
     */

    'use strict';

    require('./example-index.css', 'css|url');
    require('./example-index.html', 'html|url');
    require('./example-index.json', 'json|url');
    require('./example-index.png', 'file|url');
});