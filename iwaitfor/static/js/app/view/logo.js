define(['backbone', 'text!jst/logo.jst', 'router'], function (Backbone, html, Router) {

    var LogoView = Backbone.View.extend({

        template: _.template(html),

        initialize: function () {
            this.listenTo(Router, 'route:id', this.render);
        },

        render: function () {
            this.$el.html(this.template());
            return this;
        }

    });

    return LogoView;

});