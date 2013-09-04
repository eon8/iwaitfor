// App

define(['backbone', 'model/timer', 'text!jst/timer.jst'], function(Backbone, TimerModel, html) {
  
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
      this.model.once('change', this.model.start);
      
      this.$('#numbersEdit').addClass('hidden');
      this.$('#numbers').removeClass('hidden');
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
      
      var Timer = new TimerModel(timer_data);

      // DOM ready
      $(function() {
          
        var app_view = new AppView({
  
          model: Timer,
          el: $('#timer')
  
        }).render();

        if (Timer.get('id')) {
            Timer.start();
        }
        
      });
      
    }

  }

});