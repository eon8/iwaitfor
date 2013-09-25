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
        },
        'cookie': {
            deps: ['zepto']
        },
        'getscript': {
            deps: ['zepto']
        }
    }
});

require(['app', 'cookie', 'getscript'], function (App) {

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

 - владелец выбирает публичность счетчика
 - на главной идут списки последних и популярных счетчиков
 - у счетчика есть автор и кол-во просмотров
 - счетчикам ставятся лайки

 */