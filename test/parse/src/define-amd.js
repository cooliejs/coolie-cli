/*!
 * jQuery UI Draggable 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/draggable/
 */
(function( factory ) {
    if ( typeof define === "function" && define.amd ) {

        // AMD. Register as an anonymous module.
        define(function () {
            require("1j");
            require("1k");
            require("1l");
            factory(window.jQuery);
        });
    } else {

        // Browser globals
        factory( jQuery );
    }
}(function( $ ) {
    alert(123);
}));