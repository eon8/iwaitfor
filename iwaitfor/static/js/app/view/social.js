define(['backbone', 'text!jst/social.jst'], function (Backbone, html) {

    return Backbone.View.extend({

        template: _.template(html),

        render: function (data) {
            this.$el.html(this.template(data));
            return this;
        },

        load: function () {
            this.render({});
            $.getScript('//vk.com/js/api/openapi.js?98', function () {
                VK.init({apiId: 3782556, onlyWidgets: true});
                VK.Widgets.Comments('vk_comments', {limit: 5, width: "250", attach: false});
            });
        }

    });

});