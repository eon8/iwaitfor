// Router

define(['backbone'], function (Backbone) {

    var Router = new Backbone.Router({
        routes: {
            'id/:id': 'id'
        }
    });

    Router.on('route:id', function(id) {
      console.log('we\'re on id ' + id);
    });

    Backbone.history.start({pushState: true});

    return Router;

});