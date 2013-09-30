define(['backbone'], function (Backbone) {

    var TimerModel = Backbone.Model.extend({

        urlRoot: '/q/timer',

        interval_id: null,

        hours: -1,
        minutes: -1,
        seconds: -1,

        is_dirty: false,

        defaults: {
            enddate: new Date()
        },

        update: function () {
            // TODO сделать чтоб в enddate всегда был обект, или метод для его получения, и везде поубирать такое
            var difference = (this.get('enddate') ? new Date(this.get('enddate')).getTime() : 0)
                    - new Date().getTime(),
                hours = 0,
                minutes = 0,
                seconds = 0;

            if (difference > 0) {
                hours = Math.floor(difference / 1000 / 60 / 60);
                minutes = Math.floor((difference - hours * 60 * 60 * 1000) / 1000 / 60);
                seconds = Math.floor((difference - hours * 60 * 60 * 1000 - minutes * 60 * 1000) / 1000);
            } else {
                this.stop();
            }

            var old_hours = this.hours,
                old_minutes = this.minutes,
                old_seconds = this.seconds;

            this.hours = (hours < 10 ? '0' : '') + hours;
            this.minutes = ('0' + minutes).slice(-2);
            this.seconds = ('0' + seconds).slice(-2);

            if (old_hours != this.hours || old_minutes != this.minutes || old_seconds != this.seconds) {
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
                hours = data[4].value,
                minutes = data[5].value,
                seconds = data[6].value;

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