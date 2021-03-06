define(['backbone', 'router', 'auth/google'], function (Backbone, Router, GoogleAuth) {

    var UserModel = Backbone.Model.extend({

        auth_apis: {},
        api_name: null,
        is_busy: false,

        initialize: function () {
            this.on('change:logged_in', this.updateView.bind(this));
        },

        registerApis: function () {
            this.auth_apis.google = new GoogleAuth;
            this.auth_apis.google.on({
                logged_in: function() {
                    if (!this.get('logged_in')) {
                        this.login('google');
                    }
                }.bind(this),
                logged_out: this.logout.bind(this)
            });
        },

        login: function (api_name) {
            if ($.cookie('auth_tkt')) {
                this.api_name = api_name;
                this.set('logged_in', true);
            } else {
                var callback = function (user_data) {
                    if (!this.is_busy) {
                        this.is_busy = true;
                        var url = '/q/login/' + api_name + '?token=' + this.auth_apis[api_name].getAccessToken();
                        $.post(url, user_data, function (resp) {
                            resp = JSON.parse(resp);
                            $.cookie('user_name', resp.user_name, {path: '/'});
                            $.cookie('auth_timer_ids', resp.timer_ids, {path: '/'});
                            // TODO работа с куками
                            this.api_name = api_name;
                            this.set('logged_in', true);
                            this.is_busy = false;
                        }.bind(this));
                    }
                }.bind(this);
                this.auth_apis[api_name].getUserData(callback);
            }
        },

        logout: function () {
            $.post('/q/logout', {}, function (resp) {
                $.cookie('user_name', null, {path: '/'});
                $.cookie('auth_timer_ids', null, {path: '/'});
                this.set('logged_in', false);
            }.bind(this));
        },

        getTimerIds: function () {
            return this.get('logged_in') && $.cookie('auth_timer_ids') ? $.cookie('auth_timer_ids').split(',') : []
        },

        canEdit: function (model) {
            return model.isNew() || _.indexOf(this.getTimerIds(), String(model.id)) != -1;
        },

        updateTimer: function(model) {
            var old_timer_ids = this.getTimerIds(),
                new_timer_ids = _.union(old_timer_ids, String(model.id));
            if (new_timer_ids.length > old_timer_ids.length) {
                $.cookie('auth_timer_ids', new_timer_ids, {path: '/'});
            }
            if (model.get('is_approved')) {
                Router.navigate(model.get('name'), {trigger: true, replace: true});
            } else {
                Router.navigate('id/' + model.id, {trigger: true, replace: true});
            }
        },

        updateView: function() {
            user_name = $.cookie('user_name') || 'User';
            $('#user_name').text(user_name);
        }

    });

    return new UserModel({logged_in: false});

});