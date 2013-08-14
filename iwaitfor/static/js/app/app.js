// App

define(['backbone', 'model/counter', 'text!jst/counter.jst'], function(Backbone, CounterModel, html) {
  
  var AppView = Backbone.View.extend({
      
    template: _.template(html),

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
    },
    
    events: {
      'click #numbers': 'edit',
      'click #numbersEdit': 'editclick',
      'click #save': 'save'
    },
    
    edit: function(e) {
      e.stopPropagation();
      this.model.stop();
      this.$('#numbers').addClass('hidden');
      this.$('#numbersEdit').removeClass('hidden');

      $(document).one('click', this.set.bind(this));
    },
    
    editclick: function(e) {
      e.stopPropagation();
    },
    
    set: function(e) {
      this.model.edit(
        this.$('#numbersEdit [name=hours]').val(),
        this.$('#numbersEdit [name=minutes]').val(),
        this.$('#numbersEdit [name=seconds]').val()
      );    
      
      this.$('#numbersEdit').addClass('hidden');
      this.$('#numbers').removeClass('hidden');
      this.model.start();
    },
    
    save: function() {
      this.model.save();
    },

    render: function() {
      this.$el.html(this.template(this.model.attributes));
      return this;
    }

  });
  
  // App object
  return {

    init: function() {

      var Counter = new CounterModel({
        title: 'new counter',
        date: new Date(2013, 6, 23, 18, 00, 00)
      });

      // DOM ready
      $(function() {
          
        var app_view = new AppView({
  
          model: Counter,
          el: $('#counter')
  
        });
      
        Counter.start();
        
      });
      
    }

  }

});