// App

define(['backbone', 'model/timer', 'view/timer', 'view/auth'], function (Backbone, TimerModel, TimerView, AuthView) {

    // App object
    return {

        logged_in: false,

        init: function () {

            var Timer = new TimerModel(timer_data);

            // DOM ready
            $(function () {

                var timer_view = new TimerView({

                    model: Timer,
                    el: $('#timer')

                }).render();

                if (Timer.get('id')) {
                    Timer.start();
                }

                this.processAuth(); // checkAuth ??

            }.bind(this));

        },

        processAuth: function () {
            var auth_view = new AuthView({el: $('#auth')});
            auth_view.askAPIs(function (result) {
                this.logged_in = auth_view.logged_in = result;
                if (!this.logged_in) {
                    auth_view.render();
                } else {
                    auth_view.renewAuthTkt();
                }
            }.bind(this));
        }

    }

});