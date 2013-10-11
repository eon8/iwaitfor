define(['backbone'], function (Backbone) {

    return Backbone.Model.extend({

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

        defaults: function () {
            var date = new Date();
            date.setMilliseconds(0);
            return {
                enddate: date,
                name: null, // TODO check to be null on server
                is_public: true // TODO maybe string or int
            }
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

        edit: function (dataset, countdown) {
            // TODO validation
            dataset.name = dataset.name || null;
            dataset.is_public = !!dataset.is_public;
            dataset.enddate = new Date(dataset.end.year + '-' + dataset.end.month + '-' + dataset.end.day + ' ' + dataset.end.time);
            delete dataset.end;

            if (!this.interval_id
                && parseInt(countdown.years) == countdown.years
                && parseInt(countdown.years) >= 0
                && parseInt(countdown.months) == countdown.months
                && parseInt(countdown.months) >= 0
                && parseInt(countdown.days) == countdown.days
                && parseInt(countdown.days) >= 0
                && parseInt(countdown.hours) == countdown.hours
                && parseInt(countdown.hours) >= 0
                && parseInt(countdown.minutes) == countdown.minutes
                && parseInt(countdown.minutes) >= 0
                && parseInt(countdown.seconds) == countdown.seconds
                && parseInt(countdown.seconds) >= 0
                && (parseInt(countdown.years) > 0 || parseInt(countdown.months) > 0 || parseInt(countdown.days) > 0
                    || parseInt(countdown.hours) > 0 || parseInt(countdown.minutes) > 0 || parseInt(countdown.seconds) > 0
                )
            ) {
                var date = new Date();
                date.setFullYear(date.getFullYear() + parseInt(countdown.years));
                date.setMonth(date.getMonth() + parseInt(countdown.months));
                date.setDate(date.getDate() + parseInt(countdown.days));
                date.setHours(date.getHours() + parseInt(countdown.hours));
                date.setMinutes(date.getMinutes() + parseInt(countdown.minutes));
                date.setSeconds(date.getSeconds() + parseInt(countdown.seconds));
                date.setMilliseconds(0);
                dataset.enddate = date;
            }

            this.set(dataset);
        },

        isDirty: function () {
            return this.is_dirty;
        },

        markDirty: function () {
            this.is_dirty = true;
            $(window).on('beforeunload', this.showDirtyMessage);
        },

        markClean: function () {
            this.set({id: this.id}); // Хак, чтобы id не считалось измененным
            this.is_dirty = false;
            $(window).off('beforeunload', this.showDirtyMessage);
        },

        showDirtyMessage: function () {
            return 'Current timer is not saved. You will loose changes if you leave the page.';
        }

    });

});