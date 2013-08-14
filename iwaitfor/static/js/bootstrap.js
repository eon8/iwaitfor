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

require(['app'], function(App) {

  App.init();

});

/*

- сохранение после авторизации через соцсеть
- ссылки короче 10 символов требуют премодерацию
  до модерации будет предоставлена длинная ссылка
  с последующим 301 редиректом
- после одобрения изменение премиум-таймера так же требует премодерацию
- можно оставить жалобу с аргументацией неправильного времени
- отсеивание из этого всего спама
- ссылкы на спонсорские ресурсы

*/