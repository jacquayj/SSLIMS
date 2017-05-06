(function(SSLIMS, $, undefined) {

	// Login view, render overwrites #application div
	SSLIMS.LoginView = Backbone.View.extend({
		tagName: 'div',
		id: 'login-view',
		events: {
			'click #submit': 'checkLogin',
			'click #gatorlink': 'redirectForAuth',
			'keyup #username': 'hideError',
			'keyup #password': 'hideError',
			'click #forgot': 'forgotPassword',
			'click #create': 'createAccount'
		},
		initialize: function() {
			this.render();
		},
		redirectForAuth: function() {
			document.location = '/auth';
		},
		render: function() {
			var self = this;

			SSLIMS.loadTemplate('login/view', function(tpl) {
				
				self.$el.html(tpl(self));

				$('#application').html(self.$el);


				self.$el.on('destroyed', self.deleteView);
			}, true);
		},
		deleteView: function() {
			SSLIMS.unloadTemplate('login/view');

		},
		forgotPassword: function() {
			new SSLIMS.ForgotPasswordView();
		},
		createAccount: function() {
			new SSLIMS.CreateAccountView();
		},
		showLoader: function() {
			$("#submit", this.el).val("");
			$(".loader", this.el).show();
		},
		hideLoader: function() {
			$("#submit", this.el).val("Sign In");
			$(".loader", this.el).hide();
		},
		hideError: function(e) {
			if ( e.keyCode !== 13 ) {
				$(".tooltip-error-left", this.el).fadeOut('fast');

				$("#username", this.el).css("border-color", "#c6c6ca");
				$("#password", this.el).css("border-color", "#c6c6ca");
			}
		},
		showError: function(msg) {
			$("#username", this.el).css("border-color", "#f38585");
			$("#password", this.el).css("border-color", "#f38585");

			$(".tooltip-error-left span", this.el).html(msg);
			$(".tooltip-error-left", this.el).fadeIn('fast');
		},
		checkLogin: function(event) {
			var self = this;
			event.preventDefault();
			this.showLoader();

			SSLIMS.setAuth($('#username', this.el).val(), $('#password', this.el).val());

			SSLIMS.checkCredentials({
				valid: function() {
					window.location.hash = 'dashboard';
				},
				invalid: function() {
					self.hideLoader();
					self.showError('Wrong username or password');
				}
			});

		}
	});

	// Reset password popup, appends to body
	SSLIMS.ResetPasswordView = Backbone.View.extend({
		tagName: 'div',
  		className: 'ui-popup-bg',
  		events: {
  			'click .ui-popup-close': 'hide',
  			'click #reset': 'resetPassword',
  			'keyup #password1': 'hideError',
			'keyup #password2': 'hideError'
  		},
  		initialize: function(options) {
  			this.auth_token = options.auth_token;
  			this.user_id = options.user_id;

			this.render();
  		},
  		render: function() {

			var self = this;

  			SSLIMS.loadTemplate('login/popup-reset', function(tpl) {
				
				// Add popup content to bg div
				self.$el.html(tpl(self));

				// Get popup element
				self.popup = $('.popup-reset', self.$el);

				// Add the bg & popup to document
				$('body').append(self.$el);

	  			// Run animations
	  			self.show();

				$(window).on('resize', self.centerPopup);
			});
  		},
  		show: function() {
  			var self = this;

  			// Fade in the background
  			this.$el.fadeIn('fast', function() {
  				self.centerPopup();
  				self.popup.fadeIn('fast');
  			});
  		},
  		resetPassword: function(env) {
	  		env.preventDefault();

			var self = this;

			var p1 = $('#password1', this.$el).val();
			var p2 = $('#password2', this.$el).val();

			if ( p1 == "" || p2 == "" ) {
				this.showError('Please enter a password');
			} else {
				if ( p1 == p2 ) {
					$(".loader", this.$el).show();

					$.ajax({
						type: 'PUT',
						url: 'https://api.sslims-dev.com/v' + SSLIMS.API_VERSION + '/users/' + self.user_id + '?auth_token=' + self.auth_token,
						processData: false,
						data: JSON.stringify({
							password: p1
						}),
						success: function(resp) {
							$('form', self.$el).text("Your password has been reset, you can now close this dialog and login.");
						},
						error: function(xhr) {
							self.showError(_.isObject(xhr.responseJSON.error_message) ? xhr.responseJSON.error_message.password[0] : xhr.responseJSON.error_message);
							$(".loader", this.$el).hide();
						}
					});
				} else {
					this.showError('Passwords do not match');
				}
			}

			
  		},
  		showError: function(msg) {
  			$("#password1", this.el).css("border-color", "#f38585");
  			$("#password2", this.el).css("border-color", "#f38585");
  			$('.tooltip-error-right span', this.$el).html(msg);
  			$('.tooltip-error-right', this.$el).fadeIn('fast');
  		},
  		hideError: function(e) {
  			if ( e.keyCode !== 13 ) {
	  			$("#password1", this.el).css("border-color", "#c6c6ca");
				$("#password2", this.el).css("border-color", "#c6c6ca");
	  			$('.tooltip-error-right', this.$el).fadeOut('fast');
	  		}
  		},
  		hide: function() {
  			var self = this;

  			this.popup.fadeOut('fast', function() {
  				self.$el.fadeOut('fast', function() {
  					$(window).off('resize', self.centerPopup);
  					SSLIMS.unloadTemplate('login/popup-reset');
  					self.remove();
  				});
  			});
  		},
  		centerPopup: function() {
  			$('.popup-reset', this.el).css("margin-top", ((($(window).height() - 63) / 2) - ($('.popup-reset', this.el).height() / 2)) + "px");
  		}
	});

	// Forgot password popup, appends to body
	SSLIMS.ForgotPasswordView = Backbone.View.extend({
		tagName: 'div',
  		className: 'ui-popup-bg',
  		events: {
  			'click .ui-popup-close': 'hide',
  			'click #reset': 'resetPassword',
  			'keyup #username-email': 'hideError'
  		},
  		initialize: function() {
  			var self = this;

			SSLIMS.loadTemplate('login/popup-forgot', function(tpl) {
				self.template = tpl;
				self.render();

				$(window).on('resize', self.centerPopup);
			});
  		},
  		render: function() {
  			// Add popup content to bg div
  			this.$el.html(this.template(this));

  			// Get popup element
  			this.popup = $('.popup-forgot', this.$el);

  			// Add the bg & popup to document
  			$('body').append(this.$el);

  			// Run animations
  			this.show();
  		},
  		show: function() {
  			var self = this;

  			// Fade in the background
  			this.$el.fadeIn('fast', function() {
  				self.centerPopup();
  				self.popup.fadeIn('fast');
  			});
  		},
  		resetPassword: function(env) {
  			var self = this;

  			env.preventDefault();

  			$(".loader", this.$el).show();

  			$.ajax({ ///auth_token {type: 'password_reset', username: 'jacquayj' || email: 'jacquayj'}
  				type: 'POST',
  				url: 'https://api.sslims-dev.com/v' + SSLIMS.API_VERSION + '/auth_token',
  				processData: false,
  				data: JSON.stringify({
  					type: 'password_reset',
  					user: $('#username-email', this.$el).val()
  				}),
  				success: function(resp) {
  					$('form', self.$el).text("An reset link has been sent to your email address on file that will expire in 24 hours. Please click the link contained in the email to reset your password.");
  				},
  				error: function(xhr) {
  					self.showError(xhr.responseJSON.error_message);
  					$(".loader", this.$el).hide();
  				}
  			});
  		},
  		showError: function(msg) {
  			$("#username-email", this.el).css("border-color", "#f38585");
  			$(".tooltip-error-right span", this.el).html(msg);
  			$('.tooltip-error-right', this.$el).fadeIn('fast');
  		},
  		hideError: function(e) {
  			if ( e.keyCode !== 13 ) {
				$("#username-email", this.el).css("border-color", "#c6c6ca");
				$('.tooltip-error-right', this.$el).fadeOut('fast');
	  		}
  		},
  		hide: function() {
  			var self = this;

  			this.popup.fadeOut('fast', function() {
  				self.$el.fadeOut('fast', function() {
  					$(window).off('resize', self.centerPopup);
  					SSLIMS.unloadTemplate('login/popup-forgot');
  					self.remove();
  				});
  			});
  		},
  		centerPopup: function() {
  			$('.popup-forgot', this.el).css("margin-top", ((($(window).height() - 63) / 2) - ($('.popup-forgot', this.el).height() / 2)) + "px");
  		}
	});
	

}(window.SSLIMS = window.SSLIMS || {}, jQuery));