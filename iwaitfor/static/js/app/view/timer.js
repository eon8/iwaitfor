define(['backbone', 'model/user', 'text!jst/timer.jst', 'text!jst/timer-countdown.jst'], function (Backbone, User, html, time_html) {

    return Backbone.View.extend({

        template: _.template(html),
        time_template: _.template(time_html),

        events: {
            'click .data-view': 'edit',
            'click .data-edit': 'editclick',
            'click [type=submit]': 'save',
            'submit form': 'save'
        },

        initialize: function () {
            this.listenTo(this.model, 'sync', this.render);
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'update', this.render_time);
            this.listenTo(User, 'change:logged_in', this.render);
        },

        edit: function (e) {
            e.stopPropagation();
            if (User.canEdit(this.model)) {
                var el = $(e.currentTarget);
                el.addClass('hide');
                var input = el.parent().find('.data-edit').removeClass('hide').find('textarea, input:first');
                input.focus().val(input.val());

                if (el.hasClass('time')) {
                    this.model.stop();
                }

                $(document).one('click', function () {
                    if (this.$('.data-edit:visible').length) {
                        this.set();
                    }
                }.bind(this));
            }
        },

        editclick: function (e) {
            e.stopPropagation();
        },

        set: function () {
            var form = this.$('form')[0];
            this.model.edit({
                title: form.title.value,
                name: form.name.value,
                description: form.description.value,
                is_public: this.$('form [name=is_public]:checked').val(),
                end: {
                    month:form.end_month.value,
                    day: form.end_day.value,
                    year: form.end_year.value,
                    time: form.end_time.value
                }
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
        },

        save: function (e) {
            e.preventDefault();
            this.set();

            if (!User.get('logged_in')) {
                this.showAuthorization();
                return;
            }

            this.model.save(null, {
                success: function (model) {
                    User.updateTimer(model);
                    model.markClean();
                }.bind(this),
                error: function (model, xhr) {
                    console.log(xhr.response);
                }.bind(this)
            });
        },

        showAuthorization: function () {
            alert('You have to be authorized');
        },

        render: function () {
            this.$el.html(this.template(_.extend({
                show_save: this.model.isDirty() && this.model.isValid() && User.canEdit(this.model)
            }, this.model.attributes)));
            this.fillEndDate();
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
        },

        fillEndDate: function () {
            var month_select = this.$('[name=end_month]'),
                enddate = this.model.get('enddate');
            _.each(this.months, function(month, key) {
                month_select.append('<option value="' + key + '"' + (key == (enddate.getMonth() + 1) ? ' selected' : '') + '>' + month.name + '</option>');
            });
            this.$('[name=end_day]').val(enddate.getDate());
            this.$('[name=end_year]').val(enddate.getFullYear());
            this.$('[name=end_time]').val(enddate.toTimeString().slice(0, 8));
        },

        months: {
            1: {
                name: 'January',
                days: 31
            },
            2: {
                name: 'February',
                days: 29
            },
            3: {
                name: 'March',
                days: 31
            },
            4: {
                name: 'April',
                days: 30
            },
            5: {
                name: 'May',
                days: 31
            },
            6: {
                name: 'June',
                days: 30
            },
            7: {
                name: 'July',
                days: 31
            },
            8: {
                name: 'August',
                days: 31
            },
            9: {
                name: 'September',
                days: 30
            },
            10: {
                name: 'October',
                days: 31
            },
            11: {
                name: 'November',
                days: 30
            },
            12: {
                name: 'December',
                days: 31
            }
        }

    });

});