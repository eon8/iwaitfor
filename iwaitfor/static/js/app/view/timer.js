define(['backbone', 'text!jst/timer.jst', 'text!jst/timer-time.jst', 'model/user'], function (Backbone, html, time_html, User) {

    var TimerView = Backbone.View.extend({

        is_edit: false,

        template: _.template(html),
        time_template: _.template(time_html),

        events: {
            'click .data-view': 'edit',
            'click .data-edit': 'editclick',
            'click [type=submit]': 'save',
            'submit form': 'save'
        },

        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'update', this.render_time);
            this.listenTo(User, 'change:logged_in', this.render);
        },

        edit: function (e) {
            e.stopPropagation();
            if (User.canEdit(this.model)) {
                this.is_edit = true;

                var el = $(e.target);
                el.addClass('hide');
                el.parent().find('.data-edit').removeClass('hide');

                if (el.hasClass('time')) {
                    this.model.stop();
                }

                $(document).one('click', this.set.bind(this));
            }
        },

        editclick: function (e) {
            e.stopPropagation();
        },

        set: function () {
            if (this.is_edit) {
                this.is_edit = false;
                this.model.edit(this.$('form').serializeArray());
                if (this.model.hasChanged()) {
                    this.model.markDirty();
                }
                this.render();
                this.model.start();
            }
        },

        save: function (e) {
            e.preventDefault();
            this.set();
            // TODO too much - has to be in model
            if (User.canEdit(this.model)) {
                User.listenToOnce(this.model, 'sync', User.addTimer);
                this.model.save(null, {success: function () {
                    this.model.markClean();
                    this.render();
                }.bind(this)});
                // TODO если счетчик по нолям ил меньше минимума - не сохранять
                // TODO убрать 500 при сохранении нулей
                // TODO если метод edit не прошел валидацию - на сервер не отправляется enddate - 500
            } else {
                alert('You have to be authorized');
            }
        },

        render: function () {
            this.$el.html(this.template(_.extend({
                show_save: this.model.isDirty() && this.model.isValid() && User.canEdit(this.model)
            }, this.model.attributes)));
            this.$('[name=date]').fdatepicker();
            this.render_time();
            return this;
        },

        render_time: function () {
            if (!this.$('#timer-time').length) {
                this.render();
            } else {
                this.$('#timer-time').html(this.time_template({
                    h: this.model.hours,
                    m: this.model.minutes,
                    s: this.model.seconds
                }));
            }
            return this;
        }

    });

    return TimerView;

});