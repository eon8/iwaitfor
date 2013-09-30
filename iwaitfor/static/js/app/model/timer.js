define(['backbone'], function (Backbone) {

    var TimerModel = Backbone.Model.extend({

        urlRoot: '/q/timer',

        interval_id: null,

        datetime: {
            years: -1,
            months: -1,
            days: -1,
            hours: -1,
            minutes: -1,
            seconds: -1
        },

        is_dirty: false,

        defaults: {
            enddate: new Date()
        },

        initialize: function (attributes) {
            if (attributes.enddate) {
                this.set('enddate', new Date(attributes.enddate));
            }
        },

        update: function () {
            var enddate = this.get('enddate'),
                nowdate = new Date(),
                datetime = {
                    years: 0,
                    months: 0,
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0
                };

            if (enddate > nowdate) {
                datetime.years = enddate.getFullYear() - nowdate.getFullYear();
                datetime.months = enddate.getMonth() - nowdate.getMonth();
                datetime.days = enddate.getDate() - nowdate.getDate();
                datetime.hours = enddate.getHours() - nowdate.getHours();
                datetime.minutes = enddate.getMinutes() - nowdate.getMinutes();
                datetime.seconds = enddate.getSeconds() - nowdate.getSeconds();

                if (datetime.seconds < 0) {
                    datetime.minutes--;
                    datetime.seconds += 60;
                }

                if (datetime.minutes < 0) {
                    datetime.hours--;
                    datetime.minutes += 60;
                }

                if (datetime.hours < 0) {
                    datetime.days--;
                    datetime.hours += 24;
                }

                if (datetime.days < 0) {
                    datetime.months--;

                    var year = enddate.getFullYear(),
                        months = [
                            31, (year % 4 == 0 && year % 100 != 0 || year % 400 == 0) ? 29 : 28,
                            31, 30, 31, 30, 31, 31, 30, 31, 30, 31
                        ],
                        month = enddate.getMonth() - 1;
                    if (month < 0) {
                        month += 12;
                    }

                    datetime.days += months[month];
                }

                if (datetime.months < 0) {
                    datetime.years--;
                    datetime.months += 12;
                }

            } else {
                this.stop();
            }

            datetime.hours = (datetime.hours < 10 ? '0' : '') + datetime.hours;
            datetime.minutes = ('0' + datetime.minutes).slice(-2);
            datetime.seconds = ('0' + datetime.seconds).slice(-2);

            if (!_.isEqual(this.datetime, datetime)) {
                this.datetime = datetime;
                this.trigger('update');
            }
        },

        start: function () {
            if (!this.interval_id) {
                this.interval_id = window.setInterval(this.update.bind(this), 100);
            }
        },

        stop: function () {
            if (this.interval_id) {
                window.clearInterval(this.interval_id);
                this.interval_id = null;
            }
        },

        edit: function (data) {
            var dataset = {
                    title: data[0].value,
                    description: data[1].value
                },
                years = data[4].value,
                months = data[5].value,
                days = data[6].value,
                hours = data[7].value,
                minutes = data[8].value,
                seconds = data[9].value;

            if (!this.interval_id
                && parseInt(hours) == hours
                && parseInt(hours) >= 0
                && parseInt(minutes) == minutes
                && parseInt(minutes) >= 0
                && parseInt(seconds) == seconds
                && parseInt(seconds) >= 0
                && (parseInt(hours) > 0 || parseInt(minutes) > 0 || parseInt(seconds) > 0)
                ) {
                var date = new Date();
                date.setHours(date.getHours() + parseInt(hours));
                date.setMinutes(date.getMinutes() + parseInt(minutes));
                date.setSeconds(date.getSeconds() + parseInt(seconds));
                dataset.enddate = date;
            }

            this.set(dataset);
        },

        isDirty: function () {
            return this.is_dirty;
        },

        markDirty: function () {
            // TODO window.onbeforeunload
            this.is_dirty = true;
        },

        markClean: function () {
            this.set({id: this.id}); // Хак, чтобы id не считалось измененным
            this.is_dirty = false;
        }

    });

    return TimerModel;

});