(function(SSLIMS, $, undefined) {

	// Dashboard view, render overwrites #application div
	SSLIMS.RequestAccountView = Backbone.View.extend({
		tagName: 'div',
		id: 'request-account-view',
		events: {
			'click #check': 'refreshPage',
			'click #submit': 'submitRequest'
		},
		initialize: function(options) {
			var self = this;

			this.requests = new SSLIMS.AccountRequests();
			
			this.shibUser = options.user;

			this.render();
		},
		render: function() {
			var self = this;

			SSLIMS.loadTemplate('request_account/view', function(tpl) {
				
				self.$el.html(tpl(self));

				self.isAlreadySubmitted({
					yes: function() {
						$('#account-request-form', self.$el).hide();
						$('#thankyou', self.$el).show();

						$('#application').html(self.$el);
					},
					no: function() {
						$('#application').html(self.$el);
					}
				});
			}, true);
		},
		refreshPage: function() {
			location.reload(true);
		},
		submitRequest: function() {
			var self = this;

			var request = new SSLIMS.AccountRequest();

			request.save({
				first_name: $('#first-name', self.$el).val(),
				last_name: $('#last-name', self.$el).val(),
				email: $('#email', self.$el).val(),
				message: $('#message', self.$el).val()
			},{
				success: function() {
					$('#account-request-form', this.$el).slideUp(1000, function() {
						$('#thankyou', self.$el).slideDown(1000);
					});
				}
			});
		},
		isAlreadySubmitted: function(options) {
			var self = this;
			options = _.defaults(options, {yes: function() {}, no: function() {}});

			this.requests.fetch({
				data: {
					limit: 1,
					query: Base64.encode(JSON.stringify({
						email: self.shibUser.email
					}))
				},
				success: function(collection) {
					if ( collection.length == 0 ) {
						options.no.call(self);
					} else {
						options.yes.call(self);
					}
				}
			});
		}
		
	});

}(window.SSLIMS = window.SSLIMS || {}, jQuery));