define(['backbone'], function (Backbone) {

    function GoogleAuth() {
        this.initialize();
    }

    _.extend(
        GoogleAuth.prototype,
        {

            client_id: '818705857064',
            scope: 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email',
            requestvisibleactions: 'http://schemas.google.com/AddActivity http://schemas.google.com/CommentActivity',

            initialize: function () {
                window.___gcfg = {
                    lang: 'ru-RU',
                    parsetags: 'explicit'
                }
                $.getScript('https://apis.google.com/js/client:plusone.js', this.check.bind(this));
            },

            check: function () {
                if (!window.gapi || !gapi.signin) {
                    setTimeout(this.check.bind(this), 10);
                    return;
                }

                gapi.signin.render($('.g-signin')[0], {
                    clientid: this.client_id,
                    cookiepolicy: 'single_host_origin',
                    callback: this.signinCallback.bind(this),
                    requestvisibleactions: this.requestvisibleactions,
                    scope: this.scope
                });

                gapi.comments.render('google_comments', {
                    href: window.location,
                    width: '300',
                    height: '300',
                    first_party_property: 'BLOGGER',
                    view_type: 'FILTERED_POSTMOD'
                });
            },

            signinCallback: function (authResult) {
                if (authResult['access_token']) {
                    this.trigger('logged_in');
                    $('#google_signin').addClass('hide');
                    $('#google_signout').removeClass('hide').one('click', this.signoutHandler.bind(this));
                } else if (authResult['error']) {
                    // Update the app to reflect a signed out user
                    // Possible error values:
                    //   "user_signed_out" - User is signed-out
                    //   "access_denied" - User denied access to your app
                    //   "immediate_failed" - Could not automatically log in the user
                    console.log('Sign-in state: ' + authResult['error']);
                }
            },

            signoutHandler: function () {
                $.ajax({
                    url: 'https://accounts.google.com/o/oauth2/revoke?token=' + this.getAccessToken(),
                    type: 'GET',
                    async: false,
                    contentType: "application/json",
                    dataType: 'jsonp',
                    success: function () {
                        this.trigger('logged_out');
                        $('#google_signin').removeClass('hide');
                        $('#google_signout').addClass('hide');
                    }.bind(this),
                    error: function () {
                        window.location = 'https://plus.google.com/apps';
                    }
                });
            },

            getUserData: function (callback) {
                gapi.client.load('plus', 'v1', function () {
                    var request = gapi.client.plus.people.get({
                        'userId': 'me'
                    });
                    request.execute(callback); //TODO что-то решить с некрасивыми callback'ами
                });
            },

            getAccessToken: function () {
                return gapi.auth.getToken().access_token;
            }

        },
        Backbone.Events
    );

    return GoogleAuth;

});