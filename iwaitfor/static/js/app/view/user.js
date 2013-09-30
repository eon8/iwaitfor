define(['backbone', 'text!jst/user.jst', 'model/user'], function (Backbone, html, User) {

    // TODO model is User?
    var UserView = Backbone.View.extend({

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
            // TODO render not logged in view at start
            this.$el.html(this.template(User.getTemplateVars()));
            return this;
        }

    });

    return UserView;

});