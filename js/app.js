require([
	'lib/zepto',
	'lib/underscore',
	'lib/backbone'
], function() {
	console.log(arguments);
	App.init();
});

App = {
	init: function() {

		var list = new Backbone.Model({
			title: 'todo',
			items: {
				a: 'a',
				b: 'b'
			}
		});

		//alert(JSON.stringify(list));

		var DocumentRow = Backbone.View.extend({

			template: _.template('<%= title %> haha'), // @TODO export template

			events: {
				"click":          "open"
			},

			initialize: function() {
				this.listenTo(this.model, "change", this.render);
			},

			render: function() {
				this.$el.html(this.template(this.model.attributes));
				return this;
			},

			open: function() {
				alert('open');
			}

		});

		$(function(){

			var row = new DocumentRow({

				model: list,
				el: $('#mainView')

			});

			list.set({title: 'title'});

		});

	}
}