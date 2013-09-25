define(['backbone', 'text!jst/timer.jst'], function (Backbone, html) {

    var TimerView = Backbone.View.extend({

        template: _.template(html),

        events: {
            'click #numbers': 'edit',
            'click #numbersEdit': 'editclick',
            'click #save': 'save'
        },

        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
        },

        edit: function (e) {
            e.stopPropagation();
            this.model.stop();
            this.$('#numbers').addClass('hidden');
            this.$('#numbersEdit').removeClass('hidden');

            $(document).one('click', this.set.bind(this));
        },

        editclick: function (e) {
            e.stopPropagation();
        },

        set: function () {
            this.model.edit(
                this.$('#numbersEdit [name=hours]').val(),
                this.$('#numbersEdit [name=minutes]').val(),
                this.$('#numbersEdit [name=seconds]').val()
            );

            this.$('#numbersEdit').addClass('hidden');
            this.$('#numbers').removeClass('hidden');

            this.model.start();
        },

        save: function () {
            this.set();
            this.model.save();
        },

        render: function () {
            this.$el.html(this.template(this.model.attributes));
            return this;
        }

    });

    return TimerView;

});