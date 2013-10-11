define(['backbone', 'router', 'text!jst/logo.jst'], function (Backbone, Router, html) {

    return Backbone.View.extend({

        template: _.template(html),

        initialize: function () {
            this.listenTo(Router, 'route', this.render);
        },

        render: function () {
            this.$el.html(this.template());
            return this;
        }

    });

});