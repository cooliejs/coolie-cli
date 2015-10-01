define(function (require, exports, module) {
    'use strict';

    //require('../libs1/path1/path2/index.js');

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
});