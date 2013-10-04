define(['backbone', 'text!jst/timer.jst', 'text!jst/timer-countdown.jst', 'model/user'], function (Backbone, html, time_html, User) {

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

                var el = $(e.currentTarget);
                el.addClass('hide');
                var input = el.parent().find('.data-edit').removeClass('hide').find('textarea, input:first');
                input.focus().val(input.val());

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
                var form = this.$('form')[0];
                this.model.edit({
                    title: form.title.value,
                    name: form.name.value, // TODO check for unique
                    description: form.description.value,
                    datetime: form.datetime.value,
                    is_public: form.is_public.value
                }, {
                    years: form.years.value,
                    months: form.months.value,
                    days: form.days.value,
                    hours: form.hours.value,
                    minutes: form.minutes.value,
                    seconds: form.seconds.value
                });
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

            if (!User.get('logged_in')) {
                this.showAuthorization();
                return;
            }

            if (this.model.isNew()) {
                this.showSaveProperties();
                return;
            }

            this.saveToModel();
        },

        showAuthorization: function () {
            alert('You have to be authorized');
        },

        showSaveProperties: function () {
            // TODO refactor
            $('#myModal').foundation('reveal', 'open'); // TODO make up an id
            $('#save-properties').one('click', function () {
                var form = this.$('form')[0];
                form.name.value = $('#myModal [name=name]').val();
                form.is_public.value = $('#myModal [name=is_public]:checked').val();
                this.is_edit = true;
                this.set();
                $('#myModal').foundation('reveal', 'close');
                this.saveToModel();
            }.bind(this));
        },

        saveToModel: function () {

            this.model.once('sync', function () {
                User.addTimer(this.model); // TODO call only for new?
                this.model.markClean();
                this.render();
            }, this);

            this.model.save();
            // TODO если счетчик по нолям ил меньше минимума - не сохранять
            // TODO убрать 500 при сохранении нулей
            // TODO если метод edit не прошел валидацию - на сервер не отправляется enddate - 500
        },

        render: function () {
            this.$el.html(this.template(_.extend({
                show_save: this.model.isDirty() && this.model.isValid() && User.canEdit(this.model)
            }, this.model.attributes)));
            this.render_time();
            return this;
        },

        render_time: function () {
            if (!this.$('#timer-countdown').length) {
                this.render();
            } else {
                this.$('#timer-countdown').html(this.time_template(this.model.datetime));
            }
            return this;
        }

    });

    return TimerView;

});