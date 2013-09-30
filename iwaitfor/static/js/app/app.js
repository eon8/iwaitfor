// App

define(['backbone', 'model/timer', 'view/timer', 'model/user', 'view/user', 'view/logo'], function (Backbone, TimerModel, TimerView, User, UserView, LogoView) {

    // App object
    // TODO initialize
    return {

        init: function () {

            var Timer = new TimerModel(timer_data);

            // DOM ready
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