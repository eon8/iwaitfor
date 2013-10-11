define(['backbone', 'model/user', 'text!jst/user.jst'], function (Backbone, User, html) {

    return Backbone.View.extend({

        template: _.template(html),

        events: {
            'click #authorize-button': 'loginGoogle',
            'click #logout': 'logout'
        },

        initialize: function () {
            this.listenTo(User, 'change:logged_in', this.render);
        },

        loginGoogle: function() {
            User.loginApi('google');
        },

        logout: function() {
            User.logoutApi();
        },

        render: function () {
            this.$el.html(this.template(User.getTemplateVars()));
            return this;
        }

    });

});