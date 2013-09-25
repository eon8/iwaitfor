define(['backbone'], function (Backbone) {

    // GoogleAuth
    // TODO нужно создавать объект и грузить скрипты в конструкторе
    return _.extend({

        logged_in: false,

        client_id: '818705857064',

        scope: [
            'https://www.googleapis.com/auth/plus.login',
            'https://www.googleapis.com/auth/userinfo.email' //TODO check email without this on serverside
        ],

        check: function () {
            $.getScript('https://apis.google.com/js/client.js', this.handleClientLoad.bind(this));
        },

        handleClientLoad: function () {
            if (!gapi.auth) {
                setTimeout(this.handleClientLoad.bind(this), 10);
                return;
            }
            // TODO https://developers.google.com/+/web/api/javascript WARNING
            gapi.auth.authorize({client_id: this.client_id, scope: this.scope, immediate: true}, this.handleAuthResult.bind(this));
        },

        handleAuthResult: function (authResult) {
            if (authResult && !authResult.error) {
                this.logged_in = true;
            }
            this.trigger('checked', this.logged_in);
        },

        handleAuthClick: function () {
            gapi.auth.authorize({client_id: this.client_id, scope: this.scope, immediate: false}, this.handleAuthResult.bind(this));
        },

        getUserData: function(callback) {
            gapi.client.load('plus', 'v1', function() {
              var request = gapi.client.plus.people.get({
                'userId': 'me'
              });
              request.execute(callback); //TODO что-то решить с некрасивыми callback'ами
            });
        },

        getAccessToken: function() {
            return gapi.auth.getToken().access_token;
        }

    }, Backbone.Events);

});