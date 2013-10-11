define(['backbone', 'text!jst/other_timers.jst'], function (Backbone, html) {

    return Backbone.View.extend({

        template: _.template(html),

        render: function (data) {
            this.$el.html(this.template(data));
            return this;
        },

        load: function () {
            $.getJSON('/q/other_timers', this.render.bind(this));
        }

    });

});