define(['backbone', 'model/timer', 'view/timer', 'model/user', 'view/logo', 'view/other_timers', 'view/social'],
function (Backbone, TimerModel, TimerView, User, LogoView, OtherTimersView, SocialView) {

    return {

        init: function () {

            var Timer = new TimerModel(timer_data, {parse: true});

            $(function () {

                $(document).foundation();

                var timer_view = new TimerView({

                    model: Timer,
                    el: $('#timer')

                });

                Timer.start();

                var logo_view = new LogoView({el: $('#logo')}).render();

                if (Timer.isNew()) {
                    var other_timers_view = new OtherTimersView({el: $('#other_timers')}).load();
                } else {
                    var social_view = new SocialView({el: $('#social')}).load();
                }

                User.registerApis();

            }.bind(this));

        }

    }

});