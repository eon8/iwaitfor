define(['backbone'], function (Backbone) {

    var Router = new Backbone.Router({
        routes: {
            'id/:id': 'id',
            ':name': 'name'
        }
    });

    Router.on('route:id', function(id) {
      console.log('we\'re on id ' + id);
    });

    Router.on('route:name', function(name) {
      console.log('we\'re on name ' + name);
    });

    Backbone.history.start({pushState: true});

    return Router;

});