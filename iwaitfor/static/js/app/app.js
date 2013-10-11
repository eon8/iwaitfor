define(['backbone', 'model/timer', 'view/timer', 'model/user', 'view/user', 'view/logo'], function (Backbone, TimerModel, TimerView, User, UserView, LogoView) {

    return {

        init: function () {

            var Timer = new TimerModel(timer_data);

            $(function () {

                $(document).foundation();

                var timer_view = new TimerView({

                    model: Timer,
                    el: $('#timer')

                });

                Timer.start();

                var logo_view = new LogoView({el: $('#logo')}).render();
                var user_view = new UserView({el: $('#user')}).render();

            }.bind(this));

        }

    }

});