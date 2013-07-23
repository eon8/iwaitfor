requirejs.config({
    urlArgs: "bust=" +  (new Date()).getTime(),
    baseUrl: "/js/app",
    paths: {
      backbone: '../lib/backbone',
      underscore: '../lib/underscore',
      zepto: '../lib/zepto',
      text: '../text',
      jst: '../../jst'
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
        }
    }
});

require([
  'app'
], function(App) {

  App.init();

});