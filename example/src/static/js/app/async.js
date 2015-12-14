define(function (require, exports, module) {
    'use strict';

    require('../libs1/all.js');
    require('../libs2/some.css', 'css');
    require('../libs2/some.html', 'html|url');
    require('../libs2/some.jpg', 'image|url');
    require('../libs2/some.json', 'json');
    require('../libs2/some.txt', 'text');

    var listenHash = function () {
        switch (location.hash) {
            case '#page1':
                require.async('../pages/page1.js');
                break;

            case '#page2':
                require.async('../pages/page2.js');
                break;

            default :
                require.async('../pages/404.js');
                break;
        }
    };

    listenHash();
    window.addEventListener('hashchange', listenHash);
});