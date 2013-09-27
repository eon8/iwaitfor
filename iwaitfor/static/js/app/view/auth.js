define(['backbone', 'text!jst/auth.jst', 'auth/google'], function (Backbone, html, GoogleAuth) {

    var AuthView = Backbone.View.extend({

        template: _.template(html),

        events: {
            'click #authorize-button': 'googleLogin',
            'click #logout': 'googleLogout'
        },

        auth_apis: {},

        auth_counter: 0,

        logged_in: false,

        initialize: function () {
            this.auth_apis.google = new GoogleAuth;
        },

        askAPIs: function (callback) {
            var result = false;
            this.auth_counter = _.size(this.auth_apis);
            var checked_handler = function (logged_in) {
                this.auth_counter--;
                result |= logged_in;
                if (!this.auth_counter) {
                    callback(result);
                }
            }.bind(this);
            _.each(this.auth_apis, function (api) {
                api.once('checked', checked_handler);
                api.check();
            });
        },

        renewAuthTkt: function () {
            _.each(this.auth_apis, function (api, api_name) {
                if (api.logged_in) {
                    if ($.cookie('auth_tkt')) {
                        this.logged_in = true;
                        this.render();
                    } else {
                        api.getUserData(function (user_data) {
                            this.login(api_name, api.getAccessToken(), user_data);
                        }.bind(this));
                    }
                }
            }.bind(this));
        },

        googleLogin: function() {
            this.auth_apis.google.once('checked', function(result){
                if (result) {
                    this.renewAuthTkt();
                }
            }.bind(this));
            this.auth_apis.google.handleAuthClick();
        },

        googleLogout: function() {
            this.auth_apis.google.once('unchecked', function(){
                this.logout();
            }.bind(this));
            this.auth_apis.google.handleUnAuthClick();
        },

        login: function (provider, access_token, user_data) {
            $.post('/q/login/' + provider + '?token=' + access_token, user_data, function (resp) {
                console.log(resp);
                this.logged_in = true;
                this.render();
            }.bind(this));
        },

        logout: function () {
            $.post('/q/logout', {}, function (resp) {
                console.log(resp);
                this.logged_in = false;
                this.render();
            }.bind(this));
        },

        render: function () {
            this.$el.html(this.template({logged_in: this.logged_in}));
            return this;
        }

    });

    return AuthView;

});