requirejs.config({
    urlArgs: "bust=" + (new Date()).getTime(),
    baseUrl: "/static/js/app",
    paths: {
        backbone: '../lib/backbone',
        underscore: '../lib/underscore',
        zepto: '../lib/zepto',
        cookie: '../lib/zepto.cookie',
        getscript: '../lib/zepto.getscript',
        text: '../lib/require.text',
        jst: '../../jst',

        modernizr: '../lib/modernizr',
        foundation: '../lib/foundation/foundation',
        f_reveal: '../lib/foundation/foundation.reveal',
        f_forms: '../lib/foundation/foundation.forms'
    },
    shim: {
        'backbone': {
            deps: ['underscore', 'zepto'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        },
        'zepto': {
            exports: '$'
        },
        'cookie': {
            deps: ['zepto']
        },
        'getscript': {
            deps: ['zepto']
        },
        foundation: {
            deps: ['modernizr', 'zepto']
        },
        f_reveal: {
            deps: ['foundation']
        },
        f_forms: {
            deps: ['foundation']
        }
    }
});

require(['app', 'cookie', 'getscript', 'foundation', 'f_reveal', 'f_forms'], function (App) {

    App.init();

});