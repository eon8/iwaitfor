define(['backbone'], function(Backbone) {
    
  var CounterModel = Backbone.Model.extend({
     
    urlRoot : '/q/timer',

    timer_id: null,

    update: function() {
      var current = new Date(),
          difference = new Date(this.get('date')).getTime()
          - current.getTime(),
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
      
      this.set({
        h: hours,
        m: ('0' + minutes).slice(-2),
        s: ('0' + seconds).slice(-2)
      });
    },

    start: function() {
      if (!this.timer_id) {
        this.timer_id = window.setInterval(this.update.bind(this), 100);
      }
    },
    
    stop: function() {
      if (this.timer_id) {
        window.clearInterval(this.timer_id);
        this.timer_id = null;
      }
    },
    
    edit: function(h, m, s) {
       if (
        parseInt(h) == h
        && parseInt(h) >= 0
        && parseInt(m) == m
        && parseInt(m) >= 0
        && parseInt(s) == s
        && parseInt(s) >= 0
      ) {
        var date = new Date();
        date.setHours(date.getHours() + parseInt(h));
        date.setMinutes(date.getMinutes() + parseInt(m));
        date.setSeconds(date.getSeconds() + parseInt(s));
        this.set({date: date});
      }
    }

  });
    
  return CounterModel;

});