define(function (require, exports, module) {
    'use strict';

    require('../libs1/path1/path2/index.js');

    switch (location.hash) {
        case '#page1':
            require.async('../page1.js');
            break;

        case '#page2':
            require.async('../page2.js');
            break;

        default :
            require.async('../404.js');
            break;
    }
});