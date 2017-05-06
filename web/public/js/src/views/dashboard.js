(function(SSLIMS, $, undefined) {


	SSLIMS.ContactReportPopupView = Backbone.View.extend({
		tagName: 'div',
		className: 'ui-popup-bg',
		events: {
			'click .ui-popup-close': 'hide',
			'submit form': 'sendMessage'
		},
		initialize: function(options) {
			this.render();
		},
		sendMessage: function(ev) {
			var self = this;
			ev.preventDefault();

			var reason = $('#reason-field', this.$el).val();
			var importance = $('#importance-field', this.$el).val();
			var preference = $('#response-field', this.$el).val();
			var message = $('#message-field', this.$el).val();

			(new SSLIMS.Email({
				recipient: 'jacquayj@ufl.edu',
				subject: 'SSLIMS: New ' + reason + ' From ' + SSLIMS.user.get('first_name') + ' ' + SSLIMS.user.get('last_name'),
				message:
					'From: ' + SSLIMS.user.get('first_name') + ' ' + SSLIMS.user.get('last_name') + " <" + SSLIMS.user.get('email') + ">\n" +
					'Reason: ' + reason + "\n" +
					'Importance: ' + importance + "\n" +
					'Response Preference: ' + preference + "\n" +
					'Message: ' + message + "\n"
			})).save(null, {success: function() {
				var f = $('#contact-report-form', self.$el);

				f.slideUp('slow', function() {
					f.html("Thanks, we have recieved your message. We'll get back to you ASAP.");
					f.slideDown('slow');
				});
			}});
		},
		render: function() {
			var self = this;

			SSLIMS.loadTemplate('dashboard/popup-contact-report', function(tpl) {

				// Add popup content to bg div
				self.$el.html(tpl(self));
			
				// Get popup element
				self.popup = $('.popup-reset', self.$el);

				// Add the bg & popup to document
				$('body').append(self.$el);

	  			// Run animations
	  			self.show();


			}, true);
		},
		show: function() {
			var self = this;

			// Fade in the background
			this.$el.fadeIn(200, function() {
				self.popup.slideDown(200);
			});
		},
		hide: function() {
			var self = this;

			this.popup.slideUp(200, function() {
				self.$el.fadeOut(200, function() {
					SSLIMS.unloadTemplate('dashboard/popup-contact-report');
					self.remove();
				});
			});
		}
	});

	// Dashboard view, render overwrites #application div
	SSLIMS.DashboardView = Backbone.View.extend({
		tagName: 'div',
		id: 'dashboard-view',
		events: {
			'click #logout': 'logout',
			'click #expand': 'toggleNavigation',
			'submit #site-search-form': 'search',
			'click .help-btn': 'documentation',
			'click #bread #user-full-name': 'settings',
			'click #bread .glyphicon-cog': 'settings',
			'click #contact-icon': 'contact',
			'touchend #contact-icon': 'contact'
		},
		initialize: function(options) {
			var self = this;

			this.toggleNav = options.toggleNav;
			this.renderComplete = options.renderComplete ? options.renderComplete : (function() {});
			this.user = SSLIMS.user;

			SSLIMS.user.on('change:first_name change:last_name', function() {
				self.updateName();
			});

			this.render();
		},
		contact: function() {
			new SSLIMS.ContactReportPopupView();

		},
		settings: function() {
			window.location.hash = 'settings';
		},
		documentation: function() {
			window.location.hash = 'docs';
		},
		render: function() {
			var self = this;

			SSLIMS.loadTemplate('dashboard/view', function(tpl) {
				
				self.$el.html(tpl(self));

				$('.footer-year', self.$el).html((new Date()).getFullYear());

				self.updateName();

				$('#application').html(self.$el);

				self.alerts = new SSLIMS.DashboardView.AlertsView({parent: self});
				
				
				self.page = $('#page');

				if ( self.toggleNav ) {
					self.toggleNavigation();
				}


				self.renderComplete(self);
			}, true);

			self.$el.on('destroyed', self.deleteView);

		},
		updateName: function() {
			$('#user-full-name', this.$el).html('<span class="glyphicon glyphicon-cog no-margin"></span> ' + SSLIMS.user.get('first_name')._() + ' ' + SSLIMS.user.get('last_name')._());
		},
		search: function(ev) {
			ev.preventDefault();

			window.location.hash = 'search?q=' + encodeURIComponent($('#site-search', this.$el).val());
		},
		navigate: function(crumbs, customUrl) {
			var url = _.isUndefined(customUrl) ? _.last(crumbs).url : customUrl;

			this.highlightNav(url);
			this.setBreadCrumbs(crumbs);
			this.updateName();
		},
		setBreadCrumbs: function(crumbs) {
			var crumb_ul = $('#bread', this.$el).html('');

			_.each(crumbs, function(crumb) {
				crumb_ul.append('<li>/</li>');
				crumb_ul.append('<li' + (_.last(crumbs).name == crumb.name ? ' class="selected"' : '') + '><a href="#' + crumb.url + '">' + crumb.name + '</a></li>');
			});

			crumb_ul.append('<li style="float:right;" class="glyphicon glyphicon-info-sign help-btn"></li>');
			crumb_ul.append('<li style="float:right;" id="user-full-name"></li>');
			//crumb_ul.append('<li style="float:right;" ></li>');
			

		},
		highlightNav: function(url) {
			$('#navigation li', this.$el).removeClass('selected');
			$('#navigation li a[href="#' + url + '"]', this.$el).parent().addClass('selected');
		},
		deleteView: function() {
			SSLIMS.unloadTemplate('dashboard/view');
		},
		toggleNavigation: function() {

			if ( this.page.css('margin-left') == "185px" ) {
				this.collapseNavigation();
			} else {
				this.expandNavigation();
			}

		},
		collapseNavigation: function() {
			this.page.animate({
				"margin-left": "0px"
			}, 500);
		},
		expandNavigation: function() {
			this.page.animate({
				"margin-left": "185px"
			}, 500);
		},
		logout: function() {
			document.location = '/Shibboleth.sso/Logout?return=/';
		}
	});

	// Default dashboard view, render overwrites #content div in parent view
	SSLIMS.DashboardView.DefaultDashboardView = Backbone.View.extend({
		tagName: 'div',
		id: 'default-dashboard-view',
		initialize: function(options) {
			this.parent = options.parent;
			this.renderComplete = options.renderComplete ? options.renderComplete : (function() {});
			this.render();
		},
		render: function() {
			var self = this;

			// Show loader here
			var loading = new SSLIMS.LoadingView({});

			SSLIMS.loadTemplate('dashboard/default/view', function(tpl) {

				self.$el.html(tpl(self));
				
				$('#content', self.parent.$el).html('');
				$('body, html, #content').scrollTop(0);

				var w = new SSLIMS.EventWaiter(2, function() {
					$('#content', self.parent.$el).html(self.$el);
					self.renderComplete(self);
					loading.hide();
				});

				var query = {begun: true, complete: false};
				var buttons = [];
				var title = 'Recent Requests';
				var fields = [
					{'Service ID': 'name'},
					{'Customer': 'user.last_name'},
					{'Type': 'service_type'},
					{'# Samples': null},
					{'Created': 'created_at', 'sort': 'desc'},
					{'Progress': null},
					{'': null, tdClass: 'ui-table-btn'}
				];


				if ( SSLIMS.user.get('user_type') == 'staff' || SSLIMS.user.get('user_type') == 'admin' ) {
					buttons = [{
						value: 'Check-in Samples',
						class: 'btn-blue',
						click: function(models) {
							if ( models.length > 0 ) {
								var n = 0;

								// Yo dawg, so I heard you like popup callbacks
								var openPopup = function() {
									new SSLIMS.CheckinSamplePopupView({parent: self, request: models.at(n), onclose: function() {
										if ( n != (models.length - 1) ) {
											n++;
											openPopup();
										}
									}});
								};

								openPopup();
							}
						}
					},{
						value: 'Delete',
						class: 'right btn-red',
						click: function(models) {
							if ( models.length > 0 ) {
								var tbl = this;

								new SSLIMS.AlertView({
									title: 'Confirm',
									msg: 'Are you sure you want to delete ' + models.length + ' request(s)? This action cannot be undone.',
									ok: function() {
										var w = new SSLIMS.EventWaiter(models.length, function() {
											tbl.render();
										});

										_.each(models.models.clone(), function(model) {
											model.destroy({
												success: function() {
													w.finished();
												}
											});
										});
									}
								});
							}
						}
					}];


					var ssButtons = [{
						value: 'Create Sample Sheet',
						class: 'btn-green',
						click: function(models) {
							document.location = '#sheets/create';
						}
					},{
						value: 'Download Plate (.plt) File',
						click: function(models) {
							if ( models.length > 0 ) {
								var offset = 0;

								models.each(function (m) {
									setTimeout(function() {
										m.downloadPlateFile.call(m);
									}, offset);

									offset += 500;
								});
							}
						}
					}];

					if ( SSLIMS.user.get('user_type') == 'staff' || SSLIMS.user.get('user_type') == 'admin' ) {

						ssButtons.push({
							value: 'Delete',
							class: 'right btn-red',
							click: function(models) {
								if ( models.length > 0 ) {
									var tbl = this;

									new SSLIMS.AlertView({
										title: 'Confirm',
										msg: 'Are you sure you want to delete ' + models.length + ' sheet(s)? This action cannot be undone.',
										ok: function() {
											var w = new SSLIMS.EventWaiter(models.length, function() {
												tbl.render();
											});

											_.each(models.models.clone(), function(model) {
												model.destroy({
													success: function() {
														w.finished();
													}
												});
											});
										}
									});
								}
							}
						});

					}

					new SSLIMS.TableView({
						title: 'Sample Sheets',
						collection: SSLIMS.Sheets,
						query: {
							$or: [
								{status: 'Waiting to be sequenced'},
								{status: 'Sequencing initiated'}
							]
						},
						fields: [
							{'Plate ID': 'id2'},
							{'Name': 'name'},
							{'Creator': 'user.last_name'},
							{'# Samples': null},
							{'Instrument': 'instrument.alias'},
							{'Created': 'created_at', 'sort': 'desc'},
							{'Status': 'status'},
							{'': null, tdClass: 'ui-table-btn'}
						],
						eachRow: function(model) {
							return [model.get('id2'), '<a href="#sheets/' + model.get('id') + '">' + model.get('name')._() + '</a>', '<a href="#staff/' + model.get('user').id + '">' + model.get('user').last_name._() + ', ' + model.get('user').first_name._() + '</a>', Object.keys(model.get('wells')).length, model.get('instrument').alias._(), (new Date(model.get('created_at'))).toLocaleDateString(), model.get('status')._(), '<a href="#sheets/' + model.get('id') + '" class="ui-table-item-view glyphicon glyphicon-new-window"></a>'];
						},
						options: {
							perPage: 10,
							filter: true
						},
						buttons: ssButtons 
					}).render(function($el) {			
						$('#recent-sheets', self.$el).html($el);
					});

				} else if ( SSLIMS.user.get('user_type') == 'customer' ) {
					query['user_id'] = SSLIMS.user.get('id');
					delete query['complete'];
					title = 'My Requests';
					fields.splice(1, 1);
				}

				new SSLIMS.TableView({
					title: title,
					collection: SSLIMS.Requests,
					query: query,
					fields: fields,
					eachRow: function(model) {
						var progressBar = model.getProgressBar();

						if ( SSLIMS.user.get('user_type') == 'customer' ) {
							return ['<a href="#requests/' + model.get('id') + '">' + model.get('name')._() + '</a>', model.get('service_type')._(), model.get('samples').length, (new Date(model.get('created_at'))).toLocaleDateString(), '<div class="ui-progress" style="color: ' + progressBar.textColor + ';">' + (progressBar.sequencingComplete ? 'Complete' : 'Processing') +  ' <div class="ui-progress-bar" style="width: ' + progressBar.percentage + '%;background-color: ' + progressBar.color + ';"></div></div>', '<a href="#requests/' + model.get('id') + '" class="ui-table-item-view glyphicon glyphicon-new-window"></a>'];
						} else {
							var customerField = '<a href="#customers/' + model.get('user').id + '">' + model.get('user').last_name._() + ', ' + model.get('user').first_name._() + '</a>';
							return ['<a href="#requests/' + model.get('id') + '">' + model.get('name')._() + '</a>', customerField, model.get('service_type')._(), model.get('samples').length, (new Date(model.get('created_at'))).toLocaleDateString(), '<div class="ui-progress" style="color: ' + progressBar.textColor + ';">' + (progressBar.sequencingComplete ? 'Complete' : 'Processing') +  ' <div class="ui-progress-bar" style="width: ' + progressBar.percentage + '%;background-color: ' + progressBar.color + ';"></div></div>', '<a href="#requests/' + model.get('id') + '" class="ui-table-item-view glyphicon glyphicon-new-window"></a>'];
						}
					},
					options: {
						perPage: 10,
						filter: true
					},
					buttons: buttons
				}).render(function($el) {			
					$('#recent-requests', self.$el).append($el);
					w.finished();
				});

				// new SSLIMS.TableView({
				// 	title: 'Plate Processing Queue',
				// 	collection: SSLIMS.Requests,
				// 	query: {
				// 		//$or: [{num_samples: 4}, {num_samples: 8}]
				// 	},
				// 	fields: [
				// 		{'Submitter': 'user.last_name'},
				// 		{'Type': 'service_type'},
				// 		{'# of Samples': 'num_samples'},
				// 		{'Date Created': 'created_at'},
				// 		{'Progress': null},
				// 		{'': null, tdClass: 'ui-table-btn'}
				// 	],
				// 	eachRow: function(model) {
				// 		return [model.get('user').last_name + ', ' + model.get('user').first_name, model.get('service_type'), model.get('samples').length, (new Date(model.get('created_at'))).toLocaleString(), 'progress html here', '<a href="#requests/' + model.get('id') + '" class="ui-table-item-view glyphicon glyphicon-new-window"></a>'];
				// 	},
				// 	options: {
				// 		perPage: 5,
				// 		filter: true
				// 	},
				// 	buttons: [{
				// 		value: 'New Sample Sheet',
				// 		class: 'btn-green',
				// 		excludeModels: true,
				// 		click: function() {
				// 			window.location.hash = 'sheets/create';
				// 		}
				// 	},{
				// 		value: 'Delete',
				// 		class: 'right btn-red',
				// 		click: function() {
							
				// 		}
				// 	}] 
				// }).render(function($el) {			
				// 	//$('#plate-queue', self.$el).append($el);
				 	w.finished();
				// });
			});

			self.$el.on('destroyed', self.deleteView);
			
			if ( SSLIMS.user.get('user_type') == 'customer' ) {
				this.parent.navigate([
					{name: 'My Requests', url: 'dashboard'}
				]);
			} else {
				this.parent.navigate([
					{name: 'Dashboard', url: 'dashboard'}
				]);
			}

		},
		deleteView: function() {
			SSLIMS.unloadTemplate('dashboard/default/view');
		}
	});

	SSLIMS.DashboardView.DocumentationView = Backbone.View.extend({
		tagName: 'div',
		id: 'documentation-view',
		initialize: function(options) {
			this.parent = options.parent;
			this.renderComplete = options.renderComplete ? options.renderComplete : (function() {});
			this.render();
		},
		render: function() {
			var self = this;

			SSLIMS.loadTemplate('dashboard/documentation/view', function(tpl) {

				self.$el.html(tpl(self));
				
				$('#content', self.parent.$el).html(self.$el);
				$('body, html, #content').scrollTop(0);

			});
			self.$el.on('destroyed', self.deleteView);
			this.parent.navigate([
				{name: 'Dashboard', url: 'dashboard'},
				{name: 'Documentation', url: 'docs'}
			]);

			$('.help-btn').css('color', '#248fd3');

		},
		deleteView: function() {
			SSLIMS.unloadTemplate('dashboard/documentation/view');
			$('.help-btn').css('color', '');
		}
	});

	SSLIMS.DashboardView.ViewDashboardAlertsView = Backbone.View.extend({
		tagName: 'div',
		id: 'view-dashboard-alerts-view',
		initialize: function(options) {
			this.parent = options.parent;
			
			this.render();
		},
		render: function() {
			var self = this;

			SSLIMS.loadTemplate('dashboard/dashboard_alerts/view', function(tpl) {

				self.$el.html(tpl(self));
				
				$('#content', self.parent.$el).html(self.$el);
				$('body, html, #content').scrollTop(0);

				new SSLIMS.TableView({
					title: 'Dismissed Alerts',
					collection: SSLIMS.Events,
					query: {
						'event_object._type': 'DashboardAlert',
						user_id: SSLIMS.user.get('id')
					},
					fields: [
						{'Message': 'event_object.message'},
						{'Importance': 'event_object.level'},
						{'Date': 'created_at'}
					],
					eachRow: function(model) {
						return [model.get('event_object').message, model.get('event_object').level.capitalize(), (new Date(model.get('created_at'))).toLocaleString()];
					},
					options: {
						perPage: 10,
						filter: true,
						checkBoxes: false
					}
				}).render(function($el) {			
					$('#dismissed-alerts', self.$el).append($el);
				});
			});
			self.$el.on('destroyed', self.deleteView);
			this.parent.navigate([
				{name: 'Dashboard', url: 'dashboard'},
				{name: 'Dismissed Alerts', url: 'dashboard/alerts'}
			]);

			$('#alert-icon').css('color', '#248fd3');

		},
		deleteView: function() {
			SSLIMS.unloadTemplate('dashboard/dashboard_alerts/view');
			$('#alert-icon').css('color', '');
		}
	});

	// View sheets view, render overwrites #content div in parent view
	SSLIMS.DashboardView.ViewSheetsView = Backbone.View.extend({
		tagName: 'div',
		id: 'view-sheets-view',
		initialize: function(options) {
			this.parent = options.parent;

			this.render();
		},
		render: function() {
			var self = this;

			SSLIMS.loadTemplate('dashboard/sheets/view', function(tpl) {

				self.$el.html(tpl(self));
				
				$('#content', self.parent.$el).html(self.$el);

				new SSLIMS.TableView({
					title: 'Sample Sheets',
					collection: SSLIMS.Sheets,
					query: {
						
					},
					fields: [
						{'Plate ID': 'id2'},
						{'Name': 'name'},
						{'Creator': 'user.last_name'},
						{'# Samples': null},
						{'Instrument': 'instrument.alias'},
						{'Created': 'created_at', 'sort': 'desc'},
						{'Status': 'status'},
						{'': null, tdClass: 'ui-table-btn'}
					],
					eachRow: function(model) {
						return [model.get('id2'), '<a href="#sheets/' + model.get('id') + '">' + model.get('name')._() + '</a>', '<a href="#staff/' + model.get('user').id + '">' + model.get('user').last_name._() + ', ' + model.get('user').first_name._() + '</a>', Object.keys(model.get('wells')).length, model.get('instrument').alias._(), (new Date(model.get('created_at'))).toLocaleDateString(), model.get('status')._(), '<a href="#sheets/' + model.get('id') + '" class="ui-table-item-view glyphicon glyphicon-new-window"></a>'];
					},
					options: {
						perPage: 10,
						filter: true
					},
					buttons: [{
						value: 'Create Sample Sheet',
						class: 'btn-green',
						click: function(models) {
							document.location = '#sheets/create';
						}
					},{
						value: 'Download Plate (.plt) File',
						click: function(models) {
							if ( models.length > 0 ) {
								var offset = 0;

								models.each(function (m) {
									setTimeout(function() {
										m.downloadPlateFile.call(m);
									}, offset);
									
									offset += 500;
								});
							}
						}
					}, {
						value: 'Delete',
						class: 'right btn-red',
						click: function(models) {
							if ( models.length > 0 ) {
								var tbl = this;

								new SSLIMS.AlertView({
									title: 'Confirm',
									msg: 'Are you sure you want to delete ' + models.length + ' sheet(s)? This action cannot be undone.',
									ok: function() {
										var w = new SSLIMS.EventWaiter(models.length, function() {
											tbl.render();
										});

										_.each(models.models.clone(), function(model) {
											model.destroy({
												success: function() {
													w.finished();
												}
											});
										});
									}
								});
							}
						}
					}] 
				}).render(function($el) {			
					$('#all-sheets', self.$el).append($el);
				});

			});
			self.$el.on('destroyed', self.deleteView);
			this.parent.navigate([
				{name: 'Dashboard', url: 'dashboard'},
				{name: 'Sample Sheets', url: 'sheets'}
			]);
		},
		deleteSheets: function(models, tbl) {
			var w = new SSLIMS.EventWaiter(models.length, function() {
				tbl.render();
			});

			_.each(models.models.clone(), function(model) {
				model.destroy({
					success: function() {
						w.finished();
					}
				});
			});
		},
		deleteView: function() {
			SSLIMS.unloadTemplate('dashboard/sheets/view');
		}
	});

	SSLIMS.DashboardView.SendAlertsViewCommon = Backbone.View.extend({
		tagName: 'div',
		id: 'send-alerts-view',
		events: {
			'change .alert-template': 'templateChange',
			'change .recipient-type': 'recipientChange',
			'change .customize-toggle': 'customizeChange',
			'click .send-alert': 'sendAlert'
		},
		initialize: function(options) {
			var self = this;

			if ( _.isUndefined(SSLIMS.state['send-alerts']) ) SSLIMS.state['send-alerts'] = {};
			this.state = SSLIMS.state['send-alerts'];

			this.alertTemplates = new SSLIMS.AlertTemplates();
			this.alertTemplates.fetch({success: function() {
				self.render(function($el) {

					self.alertTemplates.each(function(alertTpl) {
						$('.alert-template', $el).append('<option value="' + alertTpl.get('id') + '">' + alertTpl.get('subject') + '</option>');
					});

					if ( !_.isUndefined(self.state.recipientType) ) $('.recipient-type', $el).val(self.state.recipientType);
					if ( !_.isUndefined(self.state.selectedTemplateVal) ) $('.alert-template', $el).val(self.state.selectedTemplateVal);

					self.recipientChange();

					options.callback($el);
				});
			}});
		},
		sendEmail: function(tVars, waiter) {
			var self = this;

			var message = self.parseTemplate($('.preview-message', self.$el).val(), tVars);
			var subject = self.parseTemplate($('.preview-subject', self.$el).val(), tVars);
			var recipient = tVars.recipient.email;

			(new SSLIMS.Email({
				recipient: recipient,
				subject: subject,
				message: message
			})).save(null, {
				success: function() {
					waiter.finished();
				},
				error: function(model, response) {

					waiter.errorMsg += response.responseJSON.error_message + " ";
					waiter.error = true;

					waiter.finished();
				}
			});
		},
		sendAlert: function() {
			var self = this;

			$('.send-alert', self.$el).attr('disabled', 'disabled');

			var w = new SSLIMS.EventWaiter(self.recipients.length, function() {
				
				if ( w.error ) {
					new SSLIMS.AlertView({
						title: 'Error!',
						msg: ('There was a problem sending an email alert to one or more customers. Possible invalid customer email address, please contact support. Details: ' + w.errorMsg)
					});
				} else {
					new SSLIMS.AlertView({
						msg: 'Email has been successfully sent.'
					});
				}

				$('.send-alert', self.$el).removeAttr('disabled', 'disabled');
			});

			_.each(self.recipients, function(recipientObj) {

				var templateVars = {
					recipient: recipientObj.recipient.attributes
				};
				templateVars[self.state.recipientType] = recipientObj.model.attributes;

				if ( self.state.recipientType == 'sheet' ) {
					var sampleQuery = {'$or': []};

					// Need to join request object that belongs to recipient and has sample in current sheet
					var wells = recipientObj.model.get('wells');
					for ( var key in wells ) {
						sampleQuery['$or'].push({
							id: wells[key]
						});
					}

					// Samples is joined below already, but whatevs
					(new SSLIMS.Samples()).fetch({
						data: {
							query: Base64.encode(JSON.stringify(sampleQuery))
						}, success: function(sampleCollection) {
							var requestQuery = {'$or': []};

							sampleCollection.each(function(sample) {
								requestQuery['$or'].push({
									id: sample.get('request_id')
								});
							});

							(new SSLIMS.Requests()).fetch({
								data: {
									query: Base64.encode(JSON.stringify(requestQuery))
								},
								success: function(requestCollection) {
									var requestsForReciepient = requestCollection.where({user_id: recipientObj.recipient.get('id')});

									var w2 = new SSLIMS.EventWaiter(requestsForReciepient.length, function() {
										if ( this.error ) {
											w.error = true;
											w.errorMsg = this.errorMsg;
										}
										w.finished();
									}, true);

									for ( var k = 0; k < requestsForReciepient.length; k++ ) {
										templateVars['request'] = _.clone(requestsForReciepient[k].attributes);
										
										self.sendEmail(templateVars, w2);
									}


								}
							});
						}
					});
				} else {
					self.sendEmail(templateVars, w);
				}

				
			});
		},
		parseTemplate: function(tmp, vars) {
			return tmp.replace(/\{\{([0-9a-zA-Z\._ ]+)\}\}/g, function($0, $1) {
				var getObjProp = function(propArray, obj) {
					if ( propArray.length > 1 ) {
						var prop = propArray.splice(0, 1);

						return getObjProp(propArray, obj[prop]);
					} else {
						return obj[propArray[0]];
					}
				};

				return getObjProp($1.trim().split("."), vars);
			});
		},
		customizeChange: function() {
			$('.preview-subject', this.$el).toggleDisabled();
			$('.preview-message', this.$el).toggleDisabled();
		},
		recipientChange: function() {
			var self = this;

			self.state.recipientType = $('.recipient-type', this.$el).val();

			switch ( self.state.recipientType ) {
				case 'sheet':
					self.recipientTbl = new SSLIMS.TableView({
						title: 'Sample Sheets',
						collection: SSLIMS.Sheets,
						query: {},
						fields: [
							{'Plate ID': 'id2'},
							{'Name': 'name'},
							{'Creator': 'user.last_name'},
							{'# Samples': null},
							{'Instrument': 'instrument.alias'},
							{'Status': 'status'}
						],
						checkboxClick: function() {
							self.templateChange();
						},
						eachRow: function(model) {
							return [model.get('id2'), '<a href="#sheets/' + model.get('id') + '">' + model.get('name')._() + '</a>', '<a href="#staff/' + model.get('user').id + '">' + model.get('user').last_name._() + ', ' + model.get('user').first_name._() + '</a>', Object.keys(model.get('wells')).length, model.get('instrument').alias._(), model.get('status')._()];
						},
						options: {
							perPage: 5,
							filter: true
						},
						buttons: [] 
					}).render(function($el) {			
						$('.recipient-tbl', self.$el).html($el);
					});
					break;
				case 'request':
					self.recipientTbl = new SSLIMS.TableView({
						title: 'Requests',
						collection: SSLIMS.Requests,
						query: {},
						fields: [
							{'Service ID': 'name'},
							{'Customer': 'user.last_name'},
							{'Type': 'service_type'},
							{'# Samples': null},
							{'Date Created': 'created_at'},
							{'Progress': null},
							{'': null, tdClass: 'ui-table-btn'}
						],
						checkboxClick: function() {
							self.templateChange();
						},
						eachRow: function(model) {
							var progressBar = model.getProgressBar();

							return ['<a href="#requests/' + model.get('id') + '">' + model.get('name')._() + '</a>', '<a href="#customers/' + model.get('user').id + '">' + model.get('user').last_name._() + ', ' + model.get('user').first_name._() + '</a>', model.get('service_type')._(), model.get('samples').length, (new Date(model.get('created_at'))).toLocaleDateString(), '<div class="ui-progress" style="color: ' + progressBar.textColor + ';">' + (progressBar.sequencingComplete ? 'Complete' : 'Processing') +  ' <div class="ui-progress-bar" style="width: ' + progressBar.percentage + '%;background-color: ' + progressBar.color + ';"></div></div>', '<a href="#requests/' + model.get('id') + '" class="ui-table-item-view glyphicon glyphicon-new-window"></a>'];
						},
						options: {
							perPage: 5,
							filter: true
						},
						buttons: [] 
					}).render(function($el) {			
						$('.recipient-tbl', self.$el).html($el);
					});
					break;
				case 'user':
					self.recipientTbl = new SSLIMS.TableView({
						title: 'Users',
						collection: SSLIMS.Users,
						query: {'user_type': 'customer'},
						fields: [
							{'First Name': 'first_name'},
							{'Last Name': 'last_name'},
							{'Email': 'email'},
							{'Date Created': 'created_at'}
						],
						checkboxClick: function() {
							self.templateChange();
						},
						eachRow: function(model) {
							return [model.get('first_name')._(), model.get('last_name')._(), model.get('email')._(), (new Date(model.get('created_at'))).toLocaleString()];
						},
						options: {
							perPage: 5,
							filter: true
						},
						buttons: [] 
					}).render(function($el) {			
						$('.recipient-tbl', self.$el).html($el);
					});
					break;
			}

			self.templateChange();

		},
		templateChange: function() {
			var self = this;

			self.state.selectedTemplateVal = $('.alert-template', this.$el).val();

			var selectedTemplate = this.alertTemplates.get(self.state.selectedTemplateVal);

			var toField = $('.preview-to', this.$el);

			$('.preview-subject', this.$el).val(selectedTemplate.get('subject'));
			$('.preview-message', this.$el).val(selectedTemplate.get('message'));

			this.recipients = [];

			this.recipientTbl.getCheckedModels(function(collection) {
				toField.val('');

				var w1 = new SSLIMS.EventWaiter(collection.length, function() {
					toField.val(toField.val().replace(/, $/, ''));
				});

				collection.each(function(m) {
					switch ( self.state.recipientType ) {
						case 'sheet':
							// Get array of users belonging to the sheet, remove dupes
							m.joinSamples(function() {
								var sheet = this;

								var numSamples = sheet.get('well_samples').length;

								var w = new SSLIMS.EventWaiter(numSamples, function() {
									sheet.get('well_samples').each(function(sampleModel) {
										var user = new SSLIMS.User(sampleModel.get('user'));

										var hasUser = false;
										_.each(self.recipients, function(r) {
											if ( user.get('id') == r.recipient.get('id') && m.get('id') == r.model.get('id') ) hasUser = true;
										});

										if ( !hasUser ) {
											self.recipients.push({recipient: user, model: m});
											toField.val(toField.val() + user.get('first_name') + ' ' + user.get('last_name') + ' <' + user.get('email') + '>, ');
										}
										
									});

									w1.finished();
								});

								sheet.get('well_samples').each(function(sampleModel) {
									new SSLIMS.Request({id: sampleModel.get('request_id')}).fetch({success: function(model) {
										sampleModel.set('user', model.get('user'));
										w.finished();
									}});
								});
							});
							// Add users to recipients array, model will include joined sample 
							//console.log(m);
							break;
						case 'request':
							var user = new SSLIMS.User(m.get('user'));

							self.recipients.push({recipient: user, model: m});
							toField.val(toField.val() + user.get('first_name') + ' ' + user.get('last_name') + ' <' + user.get('email') + '>, ');
							w1.finished();
							break;
						case 'user':
							self.recipients.push({recipient: m, model: m});
							toField.val(toField.val() + m.get('first_name') + ' ' + m.get('last_name') + ' <' + m.get('email') + '>, ');
							w1.finished();
							break;
					}

				});

			});
		},
		render: function(callback) {
			var self = this;

			SSLIMS.loadTemplate('dashboard/alerts/send', function(tpl) {
				self.$el.html(tpl(self));
				callback(self.$el);
			}, true);

			self.$el.on('destroyed', self.deleteView);

		},
		deleteView: function() {
			SSLIMS.unloadTemplate('dashboard/alerts/send');
		}
	});


	SSLIMS.SendAlertsPopupView = Backbone.View.extend({
		tagName: 'div',
		className: 'ui-popup-bg',
		events: {
			'click .ui-popup-close': 'hide'
		},
		initialize: function(options) {
			this.closeURL = options.closeURL;

			this.render();
		},
		render: function() {
			var self = this;

			SSLIMS.loadTemplate('dashboard/samples/popup-send-alerts', function(tpl) {

				// Add popup content to bg div
				self.$el.html(tpl(self));
			

				new SSLIMS.DashboardView.SendAlertsViewCommon({callback: function($el) {
					$('.ui-popup', self.$el).append($el);

					// Get popup element
					self.popup = $('.popup-reset', self.$el);

					// Add the bg & popup to document
					$('body').append(self.$el);

					// Run animations
					self.show();


				}});


			}, true);
		},
		show: function() {
			var self = this;

			// Fade in the background
			this.$el.fadeIn(200, function() {
				self.popup.slideDown(200);
			});
		},
		hide: function() {
			var self = this;

			this.popup.slideUp(200, function() {
				self.$el.fadeOut(200, function() {
					SSLIMS.unloadTemplate('dashboard/samples/popup-send-alerts');
					self.remove();
					window.location.hash = self.closeURL;
				});
			});
		}
	});

	// Send alerts view, render overwrites #content div in parent view
	SSLIMS.DashboardView.SendAlertsView = Backbone.View.extend({
		tagName: 'div',
		id: 'send-alerts-view',
		initialize: function(options) {
			this.parent = options.parent;
			this.render();
		},
		render: function() {
			var self = this;

			new SSLIMS.DashboardView.SendAlertsViewCommon({callback: function($el) {
				self.$el.html($el);
				$('#content', self.parent.$el).html(self.$el);
			}});

			self.$el.on('destroyed', self.deleteView);

			this.parent.navigate([
				{name: 'Dashboard', url: 'dashboard'},
				{name: 'Alert Templates', url: 'alerts'},
				{name: 'Send Alert', url: 'alerts/send'}
			]);
		},
		deleteView: function() {
		
		}
	});


	SSLIMS.CreateControlSampleView = Backbone.View.extend({
		tagName: 'div',
			className: 'ui-popup-bg',
			events: {
				'click .ui-popup-close': 'hide',
				'click #cancel-btn': 'hide',
				'submit form': 'createControlSample'
			},
			initialize: function(options) {
				this.closeURL = options.closeURL;

			this.render();
			},
			createControlSample: function(e) {
			e.preventDefault();

			var self = this;

			(new SSLIMS.Sample()).save({
				name: $('#name', self.$el).val(),
				concentration: parseFloat($('#concentration', self.$el).val()),
				dna_ug: parseFloat($('#dna_ug', self.$el).val()),
				dna_type: $('#dna_type', self.$el).val(),
				dna_bp_size: parseFloat($('#dna_bp_size', self.$el).val()),
				primer_id: $('#primer_id', self.$el).val(),
				type: 'control'
			}, {success: function() {
				self.hide();
				}});
			},
			render: function() {
			var self = this;

				SSLIMS.loadTemplate('dashboard/config/popup-create-controlsample', function(tpl) {
				
				(new SSLIMS.Primers()).fetch({success: function(primers) {

					self.primers = primers;

					// Add popup content to bg div
					self.$el.html(tpl(self));

					// Get popup element
					self.popup = $('.popup-reset', self.$el);

					// Add the bg & popup to document
					$('body').append(self.$el);

		  			// Run animations
		  			self.show();
				}});

			});
			},
			show: function() {
				var self = this;

				// Fade in the background
				this.$el.fadeIn(200, function() {
					self.popup.slideDown(200);
				});
			},
			hide: function() {
				var self = this;

				this.popup.slideUp(200, function() {
					self.$el.fadeOut(200, function() {
						SSLIMS.unloadTemplate('dashboard/config/popup-create-controlsample');
						self.remove();
						window.location.hash = self.closeURL;
					});
				});
			}
	});

	SSLIMS.CreatePrimerView = Backbone.View.extend({
		tagName: 'div',
  		className: 'ui-popup-bg',
  		events: {
  			'click .ui-popup-close': 'hide',
  			'click #cancel-btn': 'hide',
  			'submit form': 'createPrimer'
  		},
  		initialize: function(options) {
  			this.closeURL = options.closeURL;

			this.render();
  		},
  		createPrimer: function(e) {
  			e.preventDefault();

  			var self = this;

  			(new SSLIMS.Primer()).save({
  				name: $('#name', self.$el).val(),
  				sequence: $('#sequence', self.$el).val(),
  				melting_point: parseFloat($('#melting_point', self.$el).val())
  			}, {success: function() {
  				self.hide();
  			}});
  		},
  		render: function() {
			var self = this;

  			SSLIMS.loadTemplate('dashboard/config/popup-create-primer', function(tpl) {
				
				// Add popup content to bg div
				self.$el.html(tpl(self));

				// Get popup element
				self.popup = $('.popup-reset', self.$el);

				// Add the bg & popup to document
				$('body').append(self.$el);

	  			// Run animations
	  			self.show();

			});
  		},
  		show: function() {
  			var self = this;

  			// Fade in the background
  			this.$el.fadeIn(200, function() {
  				self.popup.slideDown(200);
  			});
  		},
  		hide: function() {
  			var self = this;

  			this.popup.slideUp(200, function() {
  				self.$el.fadeOut(200, function() {
  					SSLIMS.unloadTemplate('dashboard/config/popup-create-primer');
  					self.remove();
  					window.location.hash = self.closeURL;
  				});
  			});
  		}
	});


	SSLIMS.EditControlSampleView = Backbone.View.extend({
		tagName: 'div',
  		className: 'ui-popup-bg',
  		events: {
  			'click .ui-popup-close': 'hide',
  			'click #cancel-btn': 'hide',
  			'submit form': 'saveSample'
  		},
  		initialize: function(options) {
  			this.closeURL = options.closeURL;
  			this.modelId = options.modelId;

			this.render();
  		},
  		saveSample: function(e) {
  			e.preventDefault();

			var self = this;

			self.model.save({
				name: $('#name', self.$el).val(),
				concentration: parseFloat($('#concentration', self.$el).val()),
				dna_ug: parseFloat($('#dna_ug', self.$el).val()),
				dna_type: $('#dna_type', self.$el).val(),
				dna_bp_size: parseFloat($('#dna_bp_size', self.$el).val()),
				primer_id: $('#primer_id', self.$el).val(),
				type: 'control'
			}, {success: function() {
				self.hide();
  			}});
  		},
  		render: function() {
			var self = this;

  			SSLIMS.loadTemplate('dashboard/config/popup-edit-controlsample', function(tpl) {
				(new SSLIMS.Sample({id: self.modelId})).fetch({success: function(model) {
					(new SSLIMS.Primers()).fetch({success: function(primers) {
						self.primers = primers;
						self.model = model;

						// Add popup content to bg div
						self.$el.html(tpl(self));

						// Get popup element
						self.popup = $('.popup-reset', self.$el);

						// Add the bg & popup to document
						$('body').append(self.$el);

			  			// Run animations
			  			self.show();
			  		}});
		  		}});
			});
  		},
  		show: function() {
  			var self = this;

  			// Fade in the background
  			this.$el.fadeIn(200, function() {
  				self.popup.slideDown(200);
  			});
  		},
  		hide: function() {
  			var self = this;

  			this.popup.slideUp(200, function() {
  				self.$el.fadeOut(200, function() {
  					SSLIMS.unloadTemplate('dashboard/config/popup-edit-controlsample');
  					self.remove();
  					window.location.hash = self.closeURL;
  				});
  			});
  		}
	});

	SSLIMS.EditPrimerView = Backbone.View.extend({
		tagName: 'div',
  		className: 'ui-popup-bg',
  		events: {
  			'click .ui-popup-close': 'hide',
  			'click #cancel-btn': 'hide',
  			'submit form': 'savePrimer'
  		},
  		initialize: function(options) {
  			this.closeURL = options.closeURL;
  			this.modelId = options.modelId;

			this.render();
  		},
  		savePrimer: function(e) {
  			e.preventDefault();

  			var self = this;

  			self.model.save({
  				name: $('#name', self.$el).val(),
  				sequence: $('#sequence', self.$el).val(),
  				melting_point: parseFloat($('#melting_point', self.$el).val())
  			}, {success: function() {
  				self.hide();
  			}});
  		},
  		render: function() {
			var self = this;

  			SSLIMS.loadTemplate('dashboard/config/popup-edit-primer', function(tpl) {
				
				(new SSLIMS.Primer({id: self.modelId})).fetch({success: function(model) {
					self.model = model;

					// Add popup content to bg div
					self.$el.html(tpl(self));

					// Get popup element
					self.popup = $('.popup-reset', self.$el);

					// Add the bg & popup to document
					$('body').append(self.$el);

		  			// Run animations
		  			self.show();
				}});

			});
  		},
  		show: function() {
  			var self = this;

  			// Fade in the background
  			this.$el.fadeIn(200, function() {
  				self.popup.slideDown(200);
  			});
  		},
  		hide: function() {
  			var self = this;

  			this.popup.slideUp(200, function() {
  				self.$el.fadeOut(200, function() {
  					SSLIMS.unloadTemplate('dashboard/config/popup-edit-primer');
  					self.remove();
  					window.location.hash = self.closeURL;
  				});
  			});
  		}
	});


	SSLIMS.CreateInstrumentView = Backbone.View.extend({
		tagName: 'div',
  		className: 'ui-popup-bg',
  		events: {
  			'click .ui-popup-close': 'hide',
  			'click #cancel-btn': 'hide',
  			'submit form': 'saveInstrument'
  		},
  		initialize: function(options) {
  			this.closeURL = options.closeURL;

			this.render();
  		},
  		saveInstrument: function(e) {
  			e.preventDefault();
			var self = this;

			var file = $('.instrument-photo', self.$el).get(0).files[0];
			var reader = new FileReader();

			reader.onload = function(e) {
				var b64URL = reader.result.split(',');

				var b64Content = b64URL[1].trim();
				var mime = b64URL[0].split(':')[1].split(';')[0];

				var newInstrument = {
					'alias': $('.instrument-alias', self.$el).val(),
					'application': $('.instrument-application', self.$el).val(),
					'plate_sealing': $('.instrument-plate', self.$el).val(),
					'result_group': $('.instrument-result', self.$el).val(),
					'instrument_protocol': $('.instrument-protocol', self.$el).val(),
					'analysis_protocol': $('.instrument-analysis', self.$el).val(),
					'photo_data': b64Content,
					'photo_mime': mime
				};

				if ( _.find(_.values(newInstrument), function(v) {
					if ( v == '' ) return true; 
				}) == '' ) {
					new SSLIMS.AlertView({
						title: 'Error',
						msg: 'Please specify all fields'
					});
					return;
				}

				new SSLIMS.Instrument().save(newInstrument, {
					success: function() {
						self.hide();
					},
					error: function() {
						new SSLIMS.AlertView({
							title: 'Error',
							msg: 'Something went wrong, please try again'
						});
					}
				});
			}

			if ( !_.isUndefined(file) ) {
				reader.readAsDataURL(file);
			} else {
				new SSLIMS.AlertView({
					title: 'Error',
					msg: 'Please specify photo file'
				});
			}
  		},
  		render: function() {
			var self = this;

  			SSLIMS.loadTemplate('dashboard/config/popup-create-instrument', function(tpl) {
				// Add popup content to bg div
				self.$el.html(tpl(self));

				// Get popup element
				self.popup = $('.popup-reset', self.$el);

				// Add the bg & popup to document
				$('body').append(self.$el);

				// Run animations
				self.show();
			});
  		},
  		show: function() {
  			var self = this;

  			// Fade in the background
  			this.$el.fadeIn(200, function() {
  				self.popup.slideDown(200);
  			});
  		},
  		hide: function() {
  			var self = this;

  			this.popup.slideUp(200, function() {
  				self.$el.fadeOut(200, function() {
  					SSLIMS.unloadTemplate('dashboard/config/popup-create-instrument');
  					self.remove();
  					window.location.hash = self.closeURL;
  				});
  			});
  		}
	});


	// View instruments view, render overwrites #content div in parent view
	SSLIMS.DashboardView.ViewConfigView = Backbone.View.extend({
		tagName: 'div',
		id: 'view-config-view',
		events: {
			'submit form': 'saveSettings',
			'click .create-instrument': 'createInstrument',
			'click .delete-instrument': 'deleteInstrument'
		},
		initialize: function(options) {
			var self = this;

			this.parent = options.parent;
			this.route = options.id;
			this.callback = options.callback;

			this.instruments = new SSLIMS.Instruments();
			this.instruments.fetch({
				success: function(models) {
					
					self.routeMap = {
						null: 0
					};

					var routeIndex = 0;
					models.each(function(m) {
						self.routeMap[m.get('id')] = routeIndex;
						routeIndex++;
					});

					self.render();
				}
			});
		},
		createInstrument: function() {
			document.location = '#config/instruments/create';
		},
		deleteInstrument: function(ev) {
			var self = this;

			new SSLIMS.AlertView({
				title: 'Confirm',
				msg: 'Are you sure you\'d like to delete this instrument configuration?',
				ok: function() {
					var saveId = $('.instrument-id', $(ev.target).parent()).val();
					var model = self.instruments.findWhere({id: saveId});

					model.destroy({success: function() {
						document.location = '#config';
					}});
				}
			});

		},
		render: function() {
			var self = this;

			SSLIMS.loadTemplate('dashboard/config/view', function(tpl) {

				self.$el.html(tpl(self));

				SSLIMS.TabGroup($('.ui-tab-group', self.$el), self.routeMap[self.route]);
				
				var w = new SSLIMS.EventWaiter(2, function() {
					$('#content', self.parent.$el).html(self.$el);
					if ( !_.isUndefined(self.callback) ) self.callback.call(self);
				});

				new SSLIMS.TableView({
					title: 'Control Samples',
					collection: SSLIMS.Samples,
					query: {
						type: 'control'
					},
					fields: [
						{'Template Name': 'name'},
						{'DNA Type': 'dna_type'},
						{'Primer': 'primer.name'},
						{'': null, tdClass: 'ui-table-btn'}
					],
					eachRow: function(model) {
						return ['<a href="#config/control-samples/' + model.get('id') + '/edit">' + model.get('name')._() + '</a>', model.get('dna_type')._(), model.get('primer').name._(), '<a href="#config/control-samples/' + model.get('id') + '/edit" class="ui-table-item-view glyphicon glyphicon-pencil"></a>'];
					},
					options: {
						perPage: 5,
						filter: true
					},
					buttons: [{
						value: 'Create Control Sample',
						class: 'btn-green',
						click: function(models) {
							document.location = '#config/control-samples/create';
						}
					},{
						value: 'Delete',
						class: 'btn-red right',
						click: function(models) {
							if ( models.length > 0 ) new SSLIMS.AlertView({
								title: 'Confirm',
								msg: 'Are you sure you want to delete ' + models.length + ' control sample(s)?',
								ok: function() {
									self.deleteModels(models, this);
								},
								context: this
							});
						}
					}] 
				}).render(function($el) {			
					$('#control-samples', self.$el).html($el);
					w.finished();
				});

				new SSLIMS.TableView({
					title: 'Primers',
					collection: SSLIMS.Primers,
					query: {},
					fields: [
						{'Name': 'name'},
						{'Sequence': 'sequence'},
						{'Melting Point Degrees C': 'melting_point'},
						{'': null, tdClass: 'ui-table-btn'}
					],
					eachRow: function(model) {
						return ['<a href="#config/primers/' + model.get('id') + '/edit">' + model.get('name')._() + '</a>', model.get('sequence')._(), model.get('melting_point') ? model.get('melting_point') + "&deg;" : 'N/A', '<a href="#config/primers/' + model.get('id') + '/edit" class="ui-table-item-view glyphicon glyphicon-pencil"></a>'];
					},
					options: {
						perPage: 5,
						filter: true
					},
					buttons: [{
						value: 'Create Primer',
						class: 'btn-green',
						click: function(models) {
							document.location = '#config/primers/create';
						}
					},{
						value: 'Delete',
						class: 'btn-red right',
						click: function(models) {
							if ( models.length > 0 ) new SSLIMS.AlertView({
								title: 'Confirm',
								msg: 'Are you sure you want to delete ' + models.length + ' primers(s)?',
								ok: function() {
									self.deleteModels(models, this);
								},
								context: this
							});
						}
					}] 
				}).render(function($el) {			
					$('#primers', self.$el).html($el);
					w.finished();
				});

			});

			self.$el.on('destroyed', self.deleteView);
			
			this.parent.navigate([
				{name: 'Dashboard', url: 'dashboard'},
				{name: 'Configuration Settings', url: 'config'}
			]);
		},
		deleteModels: function(models, tbl) {
			var w = new SSLIMS.EventWaiter(models.length, function() {
				tbl.render();
			});

			_.each(models.models.clone(), function(model) {
				model.destroy({
					success: function() {
						w.finished();
					}
				});
			});
		},
		saveSettings: function(ev) {
			ev.preventDefault();
			
			var saveId = $('.instrument-id', ev.target).val();
			var model = this.instruments.findWhere({id: saveId});

			model.save({
				"alias": $('.instrument-alias', ev.target).val(),
				"application": $('.instrument-application', ev.target).val(),
				"plate_sealing": $('.instrument-plate', ev.target).val(),
				"result_group": $('.instrument-result', ev.target).val(),
				"instrument_protocol": $('.instrument-protocol', ev.target).val(),
				"analysis_protocol": $('.instrument-analysis', ev.target).val()
			},{
				success: function() {
					new SSLIMS.AlertView({
						msg: 'Instrument configuration saved'
					});
				}
			});
		},
		deleteView: function() {
			SSLIMS.unloadTemplate('dashboard/config/view');
		}
	});

	SSLIMS.DisabledAccountView = Backbone.View.extend({
		tagName: 'div',
		id: 'disabled-account-view',
		events: {
			'click #check': 'refreshPage',
			'click #submit': 'submitRequest'
		},
		initialize: function(options) {
			var self = this;

			this.requests = new SSLIMS.AccountRequests();

			this.user = options.user;
			this.render();
		},
		refreshPage: function() {
			location.reload(true);
		},
		render: function() {
			var self = this;

			SSLIMS.loadTemplate('disabled/view', function(tpl) {
				
				self.$el.html(tpl(self));

				$('#application').html(self.$el);
			}, true);
		}
		
	});

	// Reset password popup, appends to body
	SSLIMS.ApproveAccountRequestView = Backbone.View.extend({
		tagName: 'div',
  		className: 'ui-popup-bg',
  		events: {
  			'click .ui-popup-close': 'hide',
  			'click #delete-btn': 'deleteRequest',
  			'submit form': 'approveAccount'
  		},
  		initialize: function(options) {
  			this.requestModel = options.requestModel;

			this.render();
  		},
  		render: function() {
			var self = this;

  			SSLIMS.loadTemplate('dashboard/users/popup-approveaccount', function(tpl) {
				
				// Add popup content to bg div
				self.$el.html(tpl(self));

				// Get popup element
				self.popup = $('.popup-reset', self.$el);

				// Add the bg & popup to document
				$('body').append(self.$el);

	  			// Run animations
	  			self.show();

			}, true);
  		},
  		deleteRequest: function() {
  			var self = this;

  			new SSLIMS.AlertView({
				title: 'Confirm',
				msg: 'Are you sure you want to delete this account request?',
				ok: function() {
					this.requestModel.destroy({
						success: function() {
							self.hide();
						}
					});
				},
				context: this
			});
  		},
  		approveAccount: function(ev) {
  			ev.preventDefault();

  			var self = this;

			new SSLIMS.User().save({
				user_type: $('#user_type', self.$el).val(),
				status: 'active',
				first_name: $('#first_name', self.$el).val(),
				last_name: $('#last_name', self.$el).val(),
				email: $('#email', self.$el).val()
			},{
				success: function() {
					self.requestModel.destroy({
						success: function() {
							self.hide();
						}
					});
				}
			});
  		},
  		show: function() {
  			var self = this;

  			// Fade in the background
  			this.$el.fadeIn(200, function() {
  				self.popup.slideDown(200);
  			});
  		},
  		hide: function() {
  			var self = this;

  			this.popup.slideUp(200, function() {
  				self.$el.fadeOut(200, function() {
  					SSLIMS.unloadTemplate('dashboard/users/popup-approveaccount');
  					self.remove();
  					window.location.hash = '#users';
  				});
  			});
  		}
	});

	// Reset password popup, appends to body
	SSLIMS.EditUserView = Backbone.View.extend({
		tagName: 'div',
  		className: 'ui-popup-bg',
  		events: {
  			'click .ui-popup-close': 'hide',
  			'submit form': 'saveAccount',
  			'click #delete-btn': 'deleteAccount'
  		},
  		initialize: function(options) {
  			this.userModel = options.userModel;

			this.render();
  		},
  		render: function() {
			var self = this;

  			SSLIMS.loadTemplate('dashboard/users/popup-edit', function(tpl) {
				
				// Add popup content to bg div
				self.$el.html(tpl(self));

				// Get popup element
				self.popup = $('.popup-edit', self.$el);

				// Add the bg & popup to document
				$('body').append(self.$el);

	  			// Run animations
	  			self.show();

			}, true);
  		},
  		saveAccount: function(ev) {
  			ev.preventDefault();

  			var self = this;

  			if ( this.userModel.get('user_type') == 'data_client' ) {
  				var updateObj = {
					status: $('#status', self.$el).val(),
					name: $('#name', self.$el).val()
				};
  			} else {
  				var updateObj = {
					user_type: $('#user_type', self.$el).val(),
					status: $('#status', self.$el).val(),
					first_name: $('#first_name', self.$el).val(),
					last_name: $('#last_name', self.$el).val(),
					email: $('#email', self.$el).val()
				};
  			}

			this.userModel.save(updateObj, {
				success: function() {
					self.hide();
				}
			});
			
  		},
  		deleteAccount: function() {
  			var self = this;

  			new SSLIMS.AlertView({
				title: 'Confirm',
				msg: 'Are you sure you want to delete this user account?',
				ok: function() {
					this.userModel.destroy({
						success: function() {
							self.hide();
						}
					});
				},
				context: this
			});
  		},
  		show: function() {
  			var self = this;

  			// Fade in the background
  			this.$el.fadeIn(200, function() {
  				self.popup.slideDown(200);
  			});
  		},
  		hide: function() {
  			var self = this;

  			this.popup.slideUp(200, function() {
  				self.$el.fadeOut(200, function() {
  					SSLIMS.unloadTemplate('dashboard/users/popup-edit');
  					self.remove();
  					window.location.hash = '#users';
  				});
  			});
  		}
	});

	// View users view, render overwrites #content div in parent view
	SSLIMS.DashboardView.ViewUsersView = Backbone.View.extend({
		tagName: 'div',
		id: 'view-users-view',
		initialize: function(options) {
			this.parent = options.parent;
			this.callback = options.callback || function() {};

			this.render();
		},
		render: function() {
			var self = this;

			SSLIMS.loadTemplate('dashboard/users/view', function(tpl) {

				self.$el.html(tpl(self));
				

				var w = new SSLIMS.EventWaiter(3, function() {
					$('#content', self.parent.$el).html(self.$el);
					self.callback(self);
				});

				self.accountRequestsTable = new SSLIMS.TableView({
					title: 'Account Requests',
					collection: SSLIMS.AccountRequests,
					query: {
						
					},
					fields: [
						{'First Name': 'first_name'},
						{'Last Name': 'last_name'},
						{'Email': 'email'},
						{'Message': 'message'},
						{'Date Submitted': 'created_at'},
						{'': null, tdClass: 'ui-table-btn'}
					],
					eachRow: function(model) {
						return [model.get('first_name')._(), model.get('last_name')._(), model.get('email')._(),  model.get('message')._(), (new Date(model.get('created_at'))).toLocaleString(), '<a href="#accountrequest/' + model.get('id') + '/approve" class="ui-table-item-view glyphicon glyphicon-new-window"></a>'];
					},
					options: {
						perPage: 5,
						filter: true,
						emptyMessage: 'No account requests found'
					},
					buttons: [{
						value: 'Approve Account',
						class: 'btn-green',
						click: function(models) {
							if ( models.length > 0 ) new SSLIMS.AlertView({
								title: 'Confirm',
								msg: 'Are you sure you\'d like to approve ' + models.length + ' account(s)?',
								ok: function() {
									self.approveAccounts(models, this);
								},
								context: this
							});
						}
					},{
						value: 'Delete Request',
						class: 'right btn-red',
						click: function(models) {
							if ( models.length > 0 ) new SSLIMS.AlertView({
								title: 'Confirm',
								msg: 'Are you sure you\'d like to delete ' + models.length + ' account request(s)?',
								ok: function() {
									self.deleteRequests(models, this);
								},
								context: this
							});
						}
					}] 
				}).render(function($el) {
					$('#account-requests', self.$el).html($el);	
					w.finished();
				});

				self.dataClientsTable = new SSLIMS.TableView({
					title: 'Data Clients',
					collection: SSLIMS.Users,
					query: {
						user_type: 'data_client'
					},
					fields: [
						{'Name': 'name'},
						{'Type': 'user_type'},
						{'Status': 'status'},
						{'Date Created': 'created_at'},
						{'': null, tdClass: 'ui-table-btn'}
					],
					eachRow: function(model) {
						return [model.get('name')._(), model.get('user_type')._(), model.get('status').capitalize()._(), (new Date(model.get('created_at'))).toLocaleString(), '<a href="#users/' + model.get('id') + '/edit" class="ui-table-item-view glyphicon glyphicon-pencil"></a>'];
					},
					options: {
						perPage: 5,
						filter: true,
						emptyMessage: 'No data clients found'
					},
					buttons: [{
						value: 'Activate Client',
						class: 'btn-green',
						click: function(models) {
							if ( models.length > 0 ) new SSLIMS.AlertView({
								title: 'Confirm',
								msg: 'Are you sure you want to activate ' + models.length + ' client(s)?',
								ok: function() {
									self.activateAccounts(models, this);
								},
								context: this
							});
						}
					},{
						value: 'Disable Client',
						class: 'btn-blue',
						click: function(models) {
							if ( models.length > 0 ) new SSLIMS.AlertView({
								title: 'Confirm',
								msg: 'Are you sure you want to disable ' + models.length + ' clients(s)? These clients will be unable to sync data.',
								ok: function() {
									self.disableAccounts(models, this);
								},
								context: this
							});
						}
					},{
						value: 'Delete Client',
						class: 'right btn-red',
						click: function(models) {
							if ( models.length > 0 ) new SSLIMS.AlertView({
								title: 'Confirm',
								msg: 'Are you sure you want to delete ' + models.length + ' client(s)?',
								ok: function() {
									self.deleteAccounts(models, this);
								},
								context: this
							});
						}
					}] 
				}).render(function($el) {
					$('#data-clients', self.$el).html($el);
					w.finished();
				});

				self.userAccountsTable = new SSLIMS.TableView({
					title: 'User Accounts',
					collection: SSLIMS.Users,
					query: {
						user_type: {'$ne': 'data_client'}
					},
					fields: [
						{'Type': 'user_type'},
						{'First Name': 'first_name'},
						{'Last Name': 'last_name'},
						{'Email': 'email'},
						{'Status': 'status'},
						{'Date Created': 'created_at'},
						{'': null, tdClass: 'ui-table-btn'}
					],
					eachRow: function(model) {
						return [model.get('user_type').capitalize()._(), model.get('first_name')._(), model.get('last_name')._(), model.get('email')._(), model.get('status').capitalize()._(), (new Date(model.get('created_at'))).toLocaleString(), '<a href="#users/' + model.get('id') + '/edit" class="ui-table-item-view glyphicon glyphicon-pencil"></a>'];
					},
					options: {
						perPage: 5,
						filter: true,
						emptyMessage: 'No user accounts found'
					},
					buttons: [{
						value: 'Activate Account',
						class: 'btn-green',
						click: function(models) {
							if ( models.length > 0 ) new SSLIMS.AlertView({
								title: 'Confirm',
								msg: 'Are you sure you want to activate ' + models.length + ' account(s)?',
								ok: function() {
									self.activateAccounts(models, this);
								},
								context: this
							});
						}
					},{
						value: 'Disable Account',
						class: 'btn-blue',
						click: function(models) {
							if ( models.length > 0 ) new SSLIMS.AlertView({
								title: 'Confirm',
								msg: 'Are you sure you want to disable ' + models.length + ' account(s)? These users will be unable to login.',
								ok: function() {
									self.disableAccounts(models, this);
								},
								context: this
							});
						}
					},{
						value: 'Login As',
						class: 'btn-blue',
						click: function(models) {
							if ( models.length > 0 ) {

								var user = models.models[0];

								new SSLIMS.AlertView({
									title: 'Confirm',
									msg: 'Are you sure you want to login as ' + user.get('email') + '? This will end your current session.',
									ok: function() {
										// Open this url with api key, close this window
										SSLIMS.DeleteCookies();
										
										var url = "https://sslims.biotech.ufl.edu/auth/" + user.get('client_api_key') + "#dashboard";
										var win = window.open(url, '_blank');
										win.focus();
										
										
										document.location = '/Shibboleth.sso/Logout?return=/';

									},
									context: this
								});
								
							}

							
						}
					},{
						value: 'Delete Account',
						class: 'right btn-red',
						click: function(models) {
							if ( models.length > 0 ) new SSLIMS.AlertView({
								title: 'Confirm',
								msg: 'Are you sure you want to delete ' + models.length + ' account(s)?',
								ok: function() {
									self.deleteAccounts(models, this);
								},
								context: this
							});
						}
					}] 
				}).render(function($el) {
					$('#users', self.$el).html($el);
					w.finished();
				});

			});
			self.$el.on('destroyed', self.deleteView);
			this.parent.navigate([
				{name: 'Dashboard', url: 'dashboard'},
				{name: 'Accounts', url: 'users'}
			]);
		},
		activateAccounts: function(models, tbl) {
			var w = new SSLIMS.EventWaiter(models.length, function() {
				tbl.render();
			});

			models.each(function(model) {
				model.save('status', 'active', {
					success: function() {
						tbl.uncheckItem(model);
						w.finished();
					}
				});
			});
		},
		disableAccounts: function(models, tbl) {
			var w = new SSLIMS.EventWaiter(models.length, function() {
				tbl.render();
			});

			models.each(function(model) {
				if ( model.get('id') != SSLIMS.user.get('id') ) {
					model.save('status', 'disabled', {
						success: function() {
							w.finished();
						}
					});
				} else {
					w.finished();
				}

				tbl.uncheckItem(model);
			});
		},
		deleteAccounts: function(models, tbl) {
			var w = new SSLIMS.EventWaiter(models.length, function() {
				tbl.render();
			});

			_.each(models.models.clone(), function(model) {
				if ( model.get('id') != SSLIMS.user.get('id') ) {
					model.destroy({
						success: function() {
							w.finished();
						}
					});
				} else {
					tbl.uncheckItem(model);
					w.finished();
				}
			});
		},
		deleteRequests: function(models, tbl) {
			var w = new SSLIMS.EventWaiter(models.length, function() {
				tbl.render();
			});

			_.each(models.models.clone(), function(model) {
				model.destroy({
					success: function() {
						w.finished();
					}
				});
			});
		},
		approveAccounts: function(models, tbl) {
			var self = this;
			models.each(function(model) {
				var newUser = new SSLIMS.User();

				newUser.save({
					user_type: 'staff',
					status: 'active',
					first_name: model.get('first_name'),
					last_name: model.get('last_name'),
					email: model.get('email')
				},{
					success: function() {
						model.destroy({
							success: function() {
								tbl.render();
								self.userAccountsTable.render();
							}
						});
					}
				});
			});

		},
		deleteView: function() {
			SSLIMS.unloadTemplate('dashboard/users/view');
		}
	});

	SSLIMS.EditAlertTemplateView = Backbone.View.extend({
		tagName: 'div',
		className: 'ui-popup-bg',
		events: {
			'click .ui-popup-close': 'hide',
			'click .edit-alert-template': 'saveAlertTemplate'
		},
		initialize: function(options) {
			this.model = options.alertTemplateModel;

			this.render();
		},
		render: function() {
			var self = this;

			SSLIMS.loadTemplate('dashboard/alerts/popup-editalerttemplate', function(tpl) {
				
				// Add popup content to bg div
				self.$el.html(tpl(self));

				// Get popup element
				self.popup = $('.popup-reset', self.$el);

				// Add the bg & popup to document
				$('body').append(self.$el);

				// Run animations
				self.show();

			}, true);
		},
		saveAlertTemplate: function() {
			var self = this;

			this.model.save({
				subject: $('.alert-template-subject', this.$el).val(),
				message: $('.alert-template-msg', this.$el).val()
			}, {success: function() {
				self.hide();
			}});
		},
		show: function() {
			var self = this;

			// Fade in the background
			this.$el.fadeIn(200, function() {
				self.popup.slideDown(200);
			});
		},
		hide: function() {
			var self = this;

			this.popup.slideUp(200, function() {
				self.$el.fadeOut(200, function() {
					SSLIMS.unloadTemplate('dashboard/alerts/popup-editalerttemplate');
					self.remove();
					window.location.hash = '#alerts';
				});
			});
		}
	});

	SSLIMS.NewAlertTemplateView = Backbone.View.extend({
		tagName: 'div',
		className: 'ui-popup-bg',
		events: {
			'click .ui-popup-close': 'hide',
			'click .create-alert-template': 'createAlertTemplate'
		},
		initialize: function(options) {

			this.render();
		},
		render: function() {
			var self = this;

			SSLIMS.loadTemplate('dashboard/alerts/popup-createalerttemplate', function(tpl) {
				
				// Add popup content to bg div
				self.$el.html(tpl(self));

				// Get popup element
				self.popup = $('.popup-reset', self.$el);

				// Add the bg & popup to document
				$('body').append(self.$el);

				// Run animations
				self.show();

			}, true);
		},
		createAlertTemplate: function() {
			var self = this;

			(new SSLIMS.AlertTemplate()).save({
				subject: $('.alert-template-subject', this.$el).val(),
				message: $('.alert-template-msg', this.$el).val()
			}, {success: function() {
				self.hide();
			}});
		},
		show: function() {
			var self = this;

			// Fade in the background
			this.$el.fadeIn(200, function() {
				self.popup.slideDown(200);
			});
		},
		hide: function() {
			var self = this;

			this.popup.slideUp(200, function() {
				self.$el.fadeOut(200, function() {
					SSLIMS.unloadTemplate('dashboard/alerts/popup-createalerttemplate');
					self.remove();
					window.location.hash = '#alerts';
				});
			});
		}
	});

	// View alerts view, render overwrites #content div in parent view
	SSLIMS.DashboardView.ViewAlertsView = Backbone.View.extend({
		tagName: 'div',
		id: 'view-alerts-view',
		initialize: function(options) {
			this.parent = options.parent;
			this.type = options.type;
			this.modelId = options.modelId;
			this.create = options.create;

			this.render();
		},
		deleteModels: function(models, tbl) {
			var w = new SSLIMS.EventWaiter(models.length, function() {
				tbl.render();
			});

			_.each(models.models.clone(), function(model) {
				model.destroy({
					success: function() {
						w.finished();
					}
				});
			});
		},
		render: function() {
			var self = this;

			SSLIMS.loadTemplate('dashboard/alerts/view', function(tpl) {

				self.$el.html(tpl(self));
				
				new SSLIMS.TableView({
					title: 'Alert Templates',
					collection: SSLIMS.AlertTemplates,
					query: {
						
					},
					fields: [
						{'Subject': 'subject'},
						{'Message': 'message'},
						{'': null, tdClass: 'ui-table-btn'}
					],
					eachRow: function(model) {
						return [model.get('subject')._(), '<textarea disabled>' + model.get('message')._() + '</textarea>', '<a href="#alerts/' + model.get('id') + '/edit" class="ui-table-item-view glyphicon glyphicon-pencil"></a>'];
					},
					options: {
						perPage: 5,
						filter: true,
						emptyMessage: 'No alert templates found'
					},
					buttons: [{
						value: 'Create Template',
						class: 'btn-blue',
						click: function(selected) {
							document.location = '#alerts/create';
						}
					},{
						value: 'Delete Template',
						class: 'btn-red right',
						click: function(models) {
							if ( models.length > 0 ) new SSLIMS.AlertView({
								title: 'Confirm',
								msg: 'Are you sure you want to delete ' + models.length + ' template(s)?',
								ok: function() {
									self.deleteModels(models, this);
								},
								context: this
							});
						}
					}] 
				}).render(function($el) {
					$('.alert-templates', self.$el).html($el);
					$('#content', self.parent.$el).html(self.$el);

					if ( self.create ) {
						new SSLIMS.NewAlertTemplateView();
					}

					// should we show edit popup?
					if ( self.modelId && $('.popup-editalerttemplate').length == 0 ) {
						(new SSLIMS.AlertTemplate({id: self.modelId})).fetch({success: function(alertTemplate) {
							new SSLIMS.EditAlertTemplateView({alertTemplateModel: alertTemplate});
						}});
					}
				});

			}, true);

			self.$el.on('destroyed', self.deleteView);

			this.parent.navigate([
				{name: 'Dashboard', url: 'dashboard'},
				{name: 'Alert Templates', url: 'alerts'}
			]);
		},
		deleteView: function() {
			SSLIMS.unloadTemplate('dashboard/alerts/view');
		}
	});

	SSLIMS.DashboardView.DraggableSample = Backbone.View.extend({
		tagName: 'div',
		className: 'drag-sample',
		initialize: function() {
			this.render();
		},
		render: function() {
			$('#application').prepend(this.$el);
			return this;
		},
		show: function(model) {
			this.model = model;
			this.$el.show();
			return this;
		},
		hide: function() {
			this.$el.hide();
			return this;
		},
		getCoords: function() {
			return this.coords;
		},
		getModel: function() {
			return this.model;
		},
		move: function(coords) {
			this.coords = coords;
			this.$el.css('left', (coords.x - 15) + 'px').css('top', (coords.y - 15) + 'px');
			return this;
		}
	});

	SSLIMS.AlertView = Backbone.View.extend({
		tagName: 'div',
		className: 'ui-popup-bg',
		events: {
			'click .ui-popup-close': 'hide',
			'click .ok-btn': 'ok',
			'click .cancel-btn': 'cancel'
		},
		initialize: function(options) {
			this.parent = options.parent;

			_.defaults(options, {
				title: 'Alert!',
				msg: '',
				iconClass: 'glyphicon-exclamation-sign',
				ok: function() {},
				cancel: function() {},
				context: this
			});

			this.options = options;

			this.render();
		},
		render: function() {
			var self = this;

			SSLIMS.loadTemplate('dashboard/alert', function(tpl) {
				
				// Add popup content to bg div
				self.$el.html(tpl(self));

				// Get popup element
				self.popup = $('.popup-reset', self.$el);

				// Add the bg & popup to document
				$('body').append(self.$el);

				// Run animations
				self.show();

			});
		},
		ok: function() {
			this.hide();
			this.options.ok.call(this.options.context);
		},
		cancel: function() {
			this.hide();
			this.options.cancel.call(this.options.context);
		},
		show: function() {
			var self = this;

			// Fade in the background
			this.$el.fadeIn(200, function() {
				self.popup.slideDown(200);
			});
		},
		hide: function() {
			var self = this;

			this.popup.slideUp(200, function() {
				self.$el.fadeOut(200, function() {
					SSLIMS.unloadTemplate('dashboard/alert');
					self.remove();
				});
			});
		}
	});

	SSLIMS.LoadingView = Backbone.View.extend({
		tagName: 'div',
		className: 'ui-popup-bg',
		events: {

		},
		initialize: function(options) {
			//this.parent = options.parent;

			// _.defaults(options, {
			// 	title: 'Alert!',
			// 	msg: '',
			// 	iconClass: 'glyphicon-exclamation-sign',
			// 	ok: function() {},
			// 	cancel: function() {},
			// 	context: this
			// });

			// this.options = options;

			this.render();
		},
		render: function() {
			var self = this;

			SSLIMS.loadTemplate('dashboard/loading', function(tpl) {
				
				// Add popup content to bg div
				self.$el.html(tpl(self));

				// Add the bg & popup to document
				$('body').append(self.$el);

				// Run animations
				self.show();

			});
		},
		show: function() {
			var self = this;

			// Fade in the background
			this.$el.fadeIn(200);
		},
		hide: function() {
			var self = this;
		
			self.$el.fadeOut(200, function() {
				SSLIMS.unloadTemplate('dashboard/loading');
				self.remove();
			});
			
		}
	});


	// Create sheet view, render overwrites #content div in parent view
	SSLIMS.DashboardView.EditSheetView = Backbone.View.extend({
		tagName: 'div',
		id: 'create-sheet-view',
		events: {
			'click .reset-sheet': 'resetSheetConfirm',
			'click .save-sheet': 'saveSheet',
			'click .load-samples': 'autoLoadSamples'
		},
		initialize: function(options) {
			var self = this;

			this.parent = options.parent;
			this.sheet_id = options.sheet_id;

			this.draggableSample = new SSLIMS.DashboardView.DraggableSample();

			this.bindDocumentEvents();
			this.isDragging = false;

			this.sheet = new SSLIMS.Sheet({id: this.sheet_id});

			this.state = SSLIMS.state;

			this.sheet.fetch({success: function() {
				self.render();
			}});
			
		},
		resetSheetConfirm: function() {
			new SSLIMS.AlertView({
				title: 'Confirm',
				msg: 'Are you sure you want to reset this sample sheet?',
				ok: this.resetSheet,
				context: this
			});
		},
		resetSheet: function() {
			this.sampleTable.resetRemoved();
			this.sampleSheet.clearAllWells();
			this.controlSampleTable.resetRemoved();
		},
		bindDocumentEvents: function() {
			$(document).on({'touchend': this.dragEnd(this)});
			$(document).mouseup(this.dragEnd(this));

			$(document).on({'touchmove': this.dragMove(this)});
			$(document).mousemove(this.dragMove(this));
		},
		dragStart: function(self) {
			return function(ev, model) {
				ev.preventDefault();

				self.isDragging = true;

				var coords = self.standardizeEventCoords(ev);

				self.sampleSheet.hideAllWells();

				self.draggableSample.move(coords).show(model);
			};
		},
		dragMove: function(self) {
			return function(ev) {
				if ( self.isDragging ) {
					ev.preventDefault();

					var coords = self.standardizeEventCoords(ev);

					self.draggableSample.move(coords);
				}
			};
		},
		dragEnd: function(self) {
			return function(ev) {
				if ( self.isDragging ) {

					self.isDragging = false;

					var coords = self.standardizeEventCoords(ev);

					self.sampleSheet.dropped(self.draggableSample.move(coords).hide());
				}
			};
		},
		getConfigID: function() {
			return $('.sheet-instrument', this.$el).val();
		},
		standardizeEventCoords: function(ev) {
			if ( _.isUndefined(ev.originalEvent.changedTouches) ) return {x: ev.pageX, y: ev.pageY};
				
			return {x: ev.originalEvent.changedTouches[0].pageX, y: ev.originalEvent.changedTouches[0].pageY};
		},
		saveSheet: function() {
			var self = this;

			var wells = {};
			var wells_config = {};

			_.each(this.sampleSheet.wells, function(well) {
				if ( well.state.hasSample ) wells[well.index] = well.state.modelData.id;
				if ( !_.isUndefined(well.state.modelData) && !_.isUndefined(well.state.modelData.config) ) wells_config[well.index] = well.state.modelData.config.id;
			});

			if ( self.sheet.get('name') == '' ) {
				new SSLIMS.AlertView({
					msg: 'Please specify a name for this sample sheet.'
				});
				return;
			}

			if ( _.isEmpty(wells) ) {
				new SSLIMS.AlertView({
					msg: 'Please add at least one sample to the sheet.'
				});
				return;
			}

			new SSLIMS.AlertView({
				title: 'Confirm',
				msg: 'Are you sure you want to save your changes to this sample sheet?',
				ok: function() {
					// Show loader here
					var loading = new SSLIMS.LoadingView({});

					var w = new SSLIMS.EventWaiter(Object.keys(wells).length + 1, function(options) {
						// invalidate cache for edit page and view sheet view
						SSLIMS.state.reset();
						SSLIMS.invalidateRouteCache('#sheets/' + options.model.get('id'));
						
						// Hide loader here
						loading.hide();

						document.location = '#sheets/' + options.model.get('id');
					});

					for ( var n in wells ) {
						(new SSLIMS.Sample({id: wells[n]})).save({status: 'Loaded, ready for sequencing'}, {success: function() {
							w.finished();
						}});
					}

					self.sheet.save({
						name: $('.sheet-name', self.$el).val(),
						status: 'Waiting to be sequenced',
						instrument_id: $('.sheet-instrument', self.$el).val(),
						wells: wells,
						wells_config: wells_config
					}, {
						includeKeys: ['wells', 'wells_config'],
						success: function(model) {
							w.finished({model: model});
						}
					});
				}
			});

		},
		autoLoadSamples: function() {
			var self = this;
			var wellIndex = SSLIMS.wellIndexConvert(parseInt($('.well-index', this.$el).val())) - 1;

			var loadingProtocol = $('.proto', this.$el).val();
			var incrementValue = (loadingProtocol == 'horizontal') ? 1 : 12;

			// Yo dawg
			var getNextOpenWell = function(current) {
				var nextIndex = current + incrementValue;

				if ( current >= 84 && loadingProtocol == 'vertical' ) {
					nextIndex = current - 83;
				}

				if ( nextIndex >= 95 ) return 95;

				if ( self.sampleSheet.wells[nextIndex].state.hasSample ) {
					nextIndex = getNextOpenWell(nextIndex);
				}

				return nextIndex;
			};

			// if well index is taken reset to next free
			if ( self.sampleSheet.wells[wellIndex].state.hasSample ) {
				wellIndex = getNextOpenWell(wellIndex);
			}

			var lastDropped = false;

			self.sampleTable.getAllModels(function(allSamples) {
				var droppedList = [];

				// Filter into map:
				// {
				// "request": []
				// }
				var requestMap = {};

				_.each(allSamples, function(sample) {
					var requestName = sample.get('request').name;
					
					if ( _.isUndefined(requestMap[requestName]) ) requestMap[requestName] = [];

					requestMap[requestName].push(sample);
				});


				for ( var requestName in requestMap ) {

					requestMap[requestName].sort(function(s1, s2) {
						if ( s1.get('inx') > s2.get('inx') ) return 1;
						if ( s1.get('inx') < s2.get('inx') ) return -1;

						return 0;
					});

					_.each(requestMap[requestName], function(sample) {
						if ( wellIndex != 95 ) {
							self.sampleSheet.droppedWell(wellIndex, sample);
							droppedList.push(sample.get('id'));

							wellIndex = getNextOpenWell(wellIndex);
						} else {
							if ( !lastDropped ) {
								lastDropped = true;
								self.sampleSheet.droppedWell(wellIndex, sample);
								droppedList.push(sample.get('id'));
							}
						}
					});
				}

				self.sampleTable.removeItems(droppedList);
			});
		},
		getSampleQuery: function() {
			var self = this;
			var list = [];
			_.each(this.sheet.get('wells'), function(sampleID, wellID) {
				list.push({
					id: sampleID
				});
			});
			return list;
		},
		getSampleIDS: function() {
			var self = this;
			var list = [];
			_.each(this.sheet.get('wells'), function(sampleID, wellID) {
				list.push(sampleID);
			});
			return list;
		},
		setupWell: function() {
			var self = this;

			if ( !self.state.firstRun ) {
				self.sampleTable.removeItems(self.getSampleIDS());
				self.state.firstRun = true;
			}

			self.sheet.joinSamples(function() {
				self.sheet.get('well_samples').each(function(model) {
					var well = null;

					// Add config to model here
					var wellIndex = _.invert(self.sheet.get('wells'))[model.get('id')];

					// Check self.model.get('wells_config') for index
					var wellConfigID = self.sheet.get('wells_config')[wellIndex];
					if ( !_.isUndefined(wellConfigID) ) {
						var config = self.instruments.get(wellConfigID);

						// Set sample config
						model.set('config', _.clone(config.attributes));
					}
					

					_.each(self.sheet.get('wells'), function(sampleID, wellID, list) {
						if ( sampleID == model.get('id') ) well = wellID;
					});

					// Add sample if it doesnt already exist and is removed from the table
					if ( !self.sampleSheet.sampleExists(model) && self.sampleTable.isItemRemoved(model.get('id')) ) {
						self.sampleSheet.droppedWell(well, model);
					}
					
				});

				
			});
		},
		render: function() {
			var self = this;

			SSLIMS.loadTemplate('dashboard/sheets/edit', function(tpl) {

				(new SSLIMS.Instruments()).fetch({success: function(instruments) {
					self.instruments = instruments;
					self.$el.html(tpl(self));

					SSLIMS.TabGroup($('.ui-tab-group', self.$el), 0);

					var w = new SSLIMS.EventWaiter(3, function() {
						self.setupWell();
					});

					self.sampleTable = new SSLIMS.TableView({
						title: 'Samples Ready To Load',
						collection: SSLIMS.Samples,
						query: {'$or': [{status: 'Received, ready to load'}, {'$or': self.getSampleQuery()}]},
						//query: {'$or': self.getSampleQuery()},
						fields: [
							{'Index': 'inx', 'sort': 'asc'},
							{'Template Name': 'name'},
							{'Request': 'request.name', 'sort': 'desc'},
							{'Primer': 'primer.name'},
							{'DNA Type': 'dna_type'}
						],
						eachRow: function(model) {
							return [model.get('inx'), '<a href="#samples/' + model.get('id') + '">' + model.get('name')._() + '</a>', model.get('request').name._(), model.get('primer').name._(), model.get('dna_type')._()];
						},
						rowMouseDown: self.dragStart(self),
						options: {
							perPage: 10,
							filter: true,
							checkBoxes: false,
							emptyMessage: 'No samples ready to be loaded'
						}
					}).render(function($el) {
						$('.well-samples', self.$el).append($el);

						w.finished();
					});

					self.controlSampleTable = new SSLIMS.TableView({
						title: 'Control Samples',
						collection: SSLIMS.Samples,
						query: {type: 'control'},
						fields: [
							{'Template Name': 'name'},
							{'Primer': 'primer.name'},
							{'DNA Type': 'dna_type'}
						],
						eachRow: function(model) {
							return ['<a href="#config/control-samples/' + model.get('id') + '/edit">' + model.get('name')._() + '</a>', model.get('primer').name._(), model.get('dna_type')._()];
						},
						rowMouseDown: self.dragStart(self),
						options: {
							perPage: 10,
							filter: true,
							checkBoxes: false,
							emptyMessage: 'No samples ready to be loaded'
						}
					}).render(function($el) {			
						$('.well-control-samples', self.$el).append($el);

						w.finished();
					});

					self.sampleSheet = new SSLIMS.SampleSheetView({parent: self}).render(function($el) {
						$('.sample-sheet', self.$el).prepend($el);

						w.finished();
					});


					$('#content', self.parent.$el).html(self.$el);
				}});

			});

			self.$el.on('destroyed', self.deleteView(self));

			this.parent.navigate([
				{name: 'Dashboard', url: 'dashboard'},
				{name: 'Sample Sheets', url: 'sheets'},
				{name: 'Sample Sheet "' + self.sheet.get('name') + '"', url: 'sheets/' + self.sheet_id},
				{name: 'Edit', url: 'sheets/' + self.sheet.get('id') + '/edit'}
			], 'sheets');
		},
		deleteView: function(self) {
			return function() {
				$(document).off({'touchend': self.dragEnd(self)});
				$(document).unbind('mouseup', self.dragEnd(self));

				$(document).off({'touchmove': self.dragMove(self)});
				$(document).unbind('mousemove', self.dragMove(self));

				self.draggableSample.remove();

				SSLIMS.unloadTemplate('dashboard/sheets/edit');
			};
		} 
	});


	// Create sheet view, render overwrites #content div in parent view
	SSLIMS.DashboardView.CreateSheetView = Backbone.View.extend({
		tagName: 'div',
		id: 'create-sheet-view',
		events: {
			'click .reset-sheet': 'resetSheetConfirm',
			'click .create-sheet': 'createSheet',
			'click .load-samples': 'autoLoadSamples'
		},
		initialize: function(options) {
			this.parent = options.parent;
			this.route = options.type;

			this.routeMap = {
				null: 0,
				'dna': 0,
				'frag': 1
			};

			this.draggableSample = new SSLIMS.DashboardView.DraggableSample();

			this.bindDocumentEvents();
			this.isDragging = false;

			this.render();
		},
		bindDocumentEvents: function() {
			$(document).on({'touchend': this.dragEnd(this)});
			$(document).mouseup(this.dragEnd(this));

			$(document).on({'touchmove': this.dragMove(this)});
			$(document).mousemove(this.dragMove(this));
		},
		dragStart: function(self) {
			return function(ev, model) {
				ev.preventDefault();

				self.isDragging = true;

				var coords = self.standardizeEventCoords(ev);

				self.sampleSheet.hideAllWells();

				self.draggableSample.move(coords).show(model);
			};
		},
		dragMove: function(self) {
			return function(ev) {
				if ( self.isDragging ) {
					ev.preventDefault();

					var coords = self.standardizeEventCoords(ev);

					self.draggableSample.move(coords);
				}
			};
		},
		dragEnd: function(self) {
			return function(ev) {
				if ( self.isDragging ) {

					self.isDragging = false;

					var coords = self.standardizeEventCoords(ev);

					self.sampleSheet.dropped(self.draggableSample.move(coords).hide());
				}
			};
		},
		standardizeEventCoords: function(ev) {
			if ( _.isUndefined(ev.originalEvent.changedTouches) ) return {x: ev.pageX, y: ev.pageY};
				
			return {x: ev.originalEvent.changedTouches[0].pageX, y: ev.originalEvent.changedTouches[0].pageY};
		},
		getConfigID: function() {
			return $('.sheet-instrument', this.$el).val();
		},
		createSheet: function() {
			var self = this;

			var newSheet = {};

			newSheet.status = 'Waiting to be sequenced';
			newSheet.name = $('.sheet-name', this.$el).val();
			newSheet.instrument_id = $('.sheet-instrument', this.$el).val();
			newSheet.wells = {};
			newSheet.wells_config = {};

			_.each(this.sampleSheet.wells, function(well) {
				if ( well.state.hasSample ) newSheet.wells[well.index] = well.state.modelData.id;
				if ( !_.isUndefined(well.state.modelData) && !_.isUndefined(well.state.modelData.config) ) newSheet.wells_config[well.index] = well.state.modelData.config.id;
			});

			if ( newSheet.name == '' ) {
				new SSLIMS.AlertView({
					msg: 'Please specify a name for this sample sheet.'
				});
				return;
			}

			if ( _.isEmpty(newSheet.wells) ) {
				new SSLIMS.AlertView({
					msg: 'Please add at least one sample to the sheet.'
				});
				return;
			}

			
			new SSLIMS.AlertView({
				title: 'Confirm',
				msg: 'Are you sure you want to commit your changes to this sample sheet?',
				ok: function() {
					
					// Show loader here
					var loading = new SSLIMS.LoadingView({});

					var w = new SSLIMS.EventWaiter(Object.keys(newSheet.wells).length + 1, function(options) {
						// Hide loader here
						loading.hide();
						document.location = '#sheets/' + options.model.get('id');
					});

					for ( var n in newSheet.wells ) {
						(new SSLIMS.Sample({id: newSheet.wells[n]})).save({status: 'Loaded, ready for sequencing'}, {success: function() {
							w.finished();
						}});
					}

					(new SSLIMS.Sheet()).save(newSheet, {success: function(model) {
						self.resetSheet();
						w.finished({model: model});
					}});
				}
			});

		},
		resetSheetConfirm: function() {
			new SSLIMS.AlertView({
				title: 'Confirm',
				msg: 'Are you sure you want to reset this sample sheet? All changes will be lost.',
				ok: this.resetSheet,
				context: this
			});
		},
		resetSheet: function() {
			this.sampleTable.resetRemoved();
			this.sampleSheet.clearAllWells();
			this.controlSampleTable.resetRemoved();
		},
		autoLoadSamples: function() {
			var self = this;
			var wellIndex = SSLIMS.wellIndexConvert(parseInt($('.well-index', this.$el).val())) - 1;

			var loadingProtocol = $('.proto', this.$el).val();
			var incrementValue = (loadingProtocol == 'horizontal') ? 1 : 12;

			// Yo dawg
			var getNextOpenWell = function(current) {
				var nextIndex = current + incrementValue;

				if ( current >= 84 && loadingProtocol == 'vertical' ) {
					nextIndex = current - 83;
				}

				if ( nextIndex >= 95 ) return 95;

				if ( self.sampleSheet.wells[nextIndex].state.hasSample ) {
					nextIndex = getNextOpenWell(nextIndex);
				}

				return nextIndex;
			};

			// if well index is taken reset to next free
			if ( self.sampleSheet.wells[wellIndex].state.hasSample ) {
				wellIndex = getNextOpenWell(wellIndex);
			}

			var lastDropped = false;

			self.sampleTable.getAllModels(function(allSamples) {
				var droppedList = [];

				// Filter into map:
				// {
				// "request": []
				// }
				var requestMap = {};

				_.each(allSamples, function(sample) {
					var requestName = sample.get('request').name;
					
					if ( _.isUndefined(requestMap[requestName]) ) requestMap[requestName] = [];

					requestMap[requestName].push(sample);
				});


				for ( var requestName in requestMap ) {

					requestMap[requestName].sort(function(s1, s2) {
						if ( s1.get('inx') > s2.get('inx') ) return 1;
						if ( s1.get('inx') < s2.get('inx') ) return -1;

						return 0;
					});

					_.each(requestMap[requestName], function(sample) {
						if ( wellIndex != 95 ) {
							self.sampleSheet.droppedWell(wellIndex, sample);
							droppedList.push(sample.get('id'));

							wellIndex = getNextOpenWell(wellIndex);
						} else {
							if ( !lastDropped ) {
								lastDropped = true;
								self.sampleSheet.droppedWell(wellIndex, sample);
								droppedList.push(sample.get('id'));
							}
						}
					});
				}

				self.sampleTable.removeItems(droppedList);
			});
		},
		render: function() {
			var self = this;

			SSLIMS.loadTemplate('dashboard/sheets/create', function(tpl) {

				(new SSLIMS.Instruments()).fetch({success: function(instruments) {
					self.instruments = instruments;
					self.$el.html(tpl(self));

					SSLIMS.TabGroup($('.ui-tab-group', self.$el), self.routeMap[self.route]);

					if ( self.routeMap[self.route] == 0 ) {
						self.sampleTable = new SSLIMS.TableView({
							title: 'Samples Ready To Load',
							collection: SSLIMS.Samples,
							query: {status: 'Received, ready to load'},
							fields: [
								{'Index': 'inx', 'sort': 'asc'},
								{'Template Name': 'name'},
								{'Request': 'request.name', 'sort': 'desc'},
								{'Primer': 'primer.name'},
								{'DNA Type': 'dna_type'}
							],
							eachRow: function(model) {
								return [model.get('inx'), '<a href="#samples/' + model.get('id') + '">' + model.get('name')._() + '</a>', model.get('request').name._(), model.get('primer').name._(), model.get('dna_type')._()];
							},
							rowMouseDown: self.dragStart(self),
							options: {
								perPage: 10,
								filter: true,
								checkBoxes: false,
								emptyMessage: 'No samples ready to be loaded'
							}
						}).render(function($el) {			
							$('.well-samples', self.$el).append($el);
						});

						self.controlSampleTable = new SSLIMS.TableView({
							title: 'Control Samples',
							collection: SSLIMS.Samples,
							query: {type: 'control'},
							fields: [
								{'Template Name': 'name'},
								{'Primer': 'primer.name'},
								{'DNA Type': 'dna_type'}
							],
							eachRow: function(model) {
								return [model.get('name')._(), model.get('primer').name._(), model.get('dna_type')._()];
							},
							rowMouseDown: self.dragStart(self),
							options: {
								perPage: 10,
								filter: true,
								checkBoxes: false,
								emptyMessage: 'No samples ready to be loaded'
							}
						}).render(function($el) {			
							$('.well-control-samples', self.$el).append($el);
						});

						self.sampleSheet = new SSLIMS.SampleSheetView({parent: self}).render(function($el) {
							$('.sample-sheet', self.$el).prepend($el);
						});
						
					}


					$('#content', self.parent.$el).html(self.$el);
				}});

			});

			self.$el.on('destroyed', self.deleteView(self));

			this.parent.navigate([
				{name: 'Dashboard', url: 'dashboard'},
				{name: 'Sample Sheets', url: 'sheets'},
				{name: 'Create Sample Sheet', url: 'sheets/create'}
			]);
		},
		deleteView: function(self) {
			return function() {
				$(document).off({'touchend': self.dragEnd(self)});
				$(document).unbind('mouseup', self.dragEnd(self));

				$(document).off({'touchmove': self.dragMove(self)});
				$(document).unbind('mousemove', self.dragMove(self));

				self.draggableSample.remove();

				SSLIMS.unloadTemplate('dashboard/sheets/create');
			};
		} 
	});


	SSLIMS.AddRunCommentsPopupView = Backbone.View.extend({
		tagName: 'div',
		className: 'ui-popup-bg',
		events: {
			'click .ui-popup-close': 'hide',
			'change select': 'presetComment',
			'click .submit-comments': 'submitComments',
			'click .del-run': 'deleteRun'
		},
		initialize: function(options) {
			this.parent = options.parent;
			this.samples = options.samples;
			this.wellMap = options.wellMap;

			this.callback = options.onclose ? options.onclose : function() {};

			this.sortSamples();

			this.render();
		},
		sortSamples: function() {
			var self = this;

			self.sortSamples = [];

			self.samples.each(function(sample) {
				sample.wellName = SSLIMS.wellIndexToName(self.wellMap[sample.get('id')]);
				self.sortSamples.push(sample);
			});

			self.sortSamples.sort(function(s1, s2) {

				var s1Letter = s1.wellName.substr(0, 1).charCodeAt(0);
				var s1Index = parseInt(s1.wellName.substr(1));

				var s2Letter = s2.wellName.substr(0, 1).charCodeAt(0);
				var s2Index = parseInt(s2.wellName.substr(1));


				if ( s1Index > s2Index ) return 1;
				if ( s1Index < s2Index ) return -1;

				if ( s1Letter > s2Letter ) return 1;
				if ( s1Letter < s2Letter ) return -1;

				return 0;
			});
		},
		deleteRun: function(e) {

			var target = $(e.target);
			var deleteId = target.attr('delid');

			new SSLIMS.AlertView({
				title: 'Confirm',
				msg: 'Are you sure you want to delete this run? This action cannot be undone.',
				ok: function() {
					(new SSLIMS.Run({id: deleteId})).destroy({
						url: SSLIMS.API_URL + '/runs/' + deleteId + "?hard=true",
						success: function() {
							target.parent().parent().remove();
						}
					});
				}
			});
		},
		submitComments: function() {
			var self = this;

			var rows = $('.comment-row', this.$el);
			var commentCount = 0;

			var w = new SSLIMS.EventWaiter(rows.size(), function() {
				self.hide();

				// if ( commentCount == 0 ) {
				// 	var alertMsg = 'No comments were posted.';
				// } else {
				// 	var alertMsg = 'Successfully posted ' + commentCount + ' comment(s).';
				// }

				// new SSLIMS.AlertView({msg: alertMsg});
			});

			rows.each(function(index) {
				var row = $(this);

				var message = $('.run-comment', row).val();
				var runId = $('.run-id', row).val();

				if ( message != '' ) {
					new SSLIMS.Comment().save({
						message: message,
						user_id: SSLIMS.user.get('id'),
						commentable_id: runId,
						commentable_type: 'Run'
					}, {success: function() {
						commentCount++;
						w.finished();
					}});
				} else {
					w.finished();
				}
			});

		},
		presetComment: function(e) {
			var target = $(e.target);
			var value = target.val();

			if ( target.val() == 'Custom' ) value = '';

			$('.run-comment', target.parent()).val(value);
		},
		render: function() {
			var self = this;

			SSLIMS.loadTemplate('dashboard/sheets/popup-runcomments', function(tpl) {
				
				// Add popup content to bg div
				self.$el.html(tpl(self));

				// Get popup element
				self.popup = $('.popup-reset', self.$el);

				

				// Add the bg & popup to document
				$('body').append(self.$el);

	  			// Run animations
	  			self.show();

			}, true);
		},
		show: function() {
			var self = this;

			// Fade in the background
			this.$el.fadeIn(200, function() {
				self.popup.slideDown(200);
			});
		},
		hide: function() {
			var self = this;

			this.popup.slideUp(200, function() {
				self.$el.fadeOut(200, function() {
					SSLIMS.unloadTemplate('dashboard/popup-runcomments');

					self.remove();
					self.callback();
				});
			});
		}
	});

	SSLIMS.DashboardView.ViewSheetCommentsView = Backbone.View.extend({
		tagName: 'div',
		id: 'view-sheet-comments-view',
		events: {
			'click .add-comments': 'addComments',
			'click .ui-comment-delete': 'deleteComment'
		},
		initialize: function(options) {
			this.samples = options.samples;
			this.sheet = options.sheet;
			this.parent = options.parent;

			this.wellMap = _.invert(this.sheet.get('wells'));

			this.sortSamples();
		},
		sortSamples: function() {
			var self = this;

			self.sortSamples = [];

			self.samples.each(function(sample) {
				sample.wellName = SSLIMS.wellIndexToName(self.wellMap[sample.get('id')]);
				self.sortSamples.push(sample);
			});

			self.sortSamples.sort(function(s1, s2) {

				var s1Letter = s1.wellName.substr(0, 1).charCodeAt(0);
				var s1Index = parseInt(s1.wellName.substr(1));

				var s2Letter = s2.wellName.substr(0, 1).charCodeAt(0);
				var s2Index = parseInt(s2.wellName.substr(1));


				if ( s1Index > s2Index ) return 1;
				if ( s1Index < s2Index ) return -1;

				if ( s1Letter > s2Letter ) return 1;
				if ( s1Letter < s2Letter ) return -1;

				return 0;
			});
		},
		deleteComment: function(e) {
			var target = $(e.target);
			var self = this;

			new SSLIMS.AlertView({
				title: 'Confirm',
				msg: 'Are you sure you want to delete this comment?',
				ok: function() {
					(new SSLIMS.Comment({id: target.attr('data-id')})).destroy({success: function() {
						self.render();
					}});
				}
			});
		},
		addComments: function() {
			var self = this;
			this.parent.enterComments(function() {
				// Welcome to callback HELL
				self.render();
			});
		},
		attachRunData: function(callback) {
			var self = this;

			var runQuery = {
				$and: [
					{sheet_id: this.sheet.get('id')},
					{$or: []}
				]
			};

			this.samples.each(function(s) {
				s.runs = [];
				runQuery['$and'][1]['$or'].push({sample_id: s.get('id')});
			});

			new SSLIMS.Runs().fetch({
				data: {
					limit: 96,
					query: Base64.encode(JSON.stringify(runQuery))
				},
				success: function(runs) {

					var userQuery = {
						$or: []
					};


					runs.each(function(run) {
						var s = self.samples.findWhere({id: run.get('sample_id')});

						//if ( _.isUndefined(s.runs) ) s.runs = [];

						var comments = [];
						_.each(run.get('comments'), function(comment) {
							if ( _.isUndefined(comment.deleted) ) {
								userQuery['$or'].push({id: comment.user_id});
								comments.push(comment);
							}
						});

						run.set('comments', comments);

						s.runs.push(run);
					});

					(new SSLIMS.Users()).fetch({
						data: {
							limit: 1000,
							query: Base64.encode(JSON.stringify(userQuery))
						},
						success: function(users) {
							runs.each(function(run) {
								_.each(run.get('comments'), function(comment) {
									comment.user = users.findWhere({id: comment.user_id});
								});
							});

							callback.call(self);
						} 
					});

				}
			});
		},
		render: function(callback) {
			var self = this;

			callback = callback ? callback : function() {};

			SSLIMS.loadTemplate('dashboard/sheets/view-comments', function(tpl) {
				self.attachRunData(function() {
					self.$el.html(tpl(self));

					callback(self.$el);
				});
			}, true);

			self.$el.on('destroyed', self.deleteView);
		},
		deleteView: function() {
			SSLIMS.unloadTemplate('dashboard/sheets/view-comments');
		}
	});

	SSLIMS.UploadEditedChromatogramsPopupView = Backbone.View.extend({
		tagName: 'div',
		className: 'ui-popup-bg',
		events: {
			'click .ui-popup-close': 'hide',
			'click .close-popup': 'hide',
			'dragover .upload-box': 'dragHover',
			'dragleave .upload-box': 'dragHover',
			'drop .upload-box': 'selectHandler'
		},
		initialize: function(options) {
			this.closeURL = options.closeURL;
			this.sheetId = options.sheetId;

			this.render();
		},
		dragHover: function(e) {
			e.stopPropagation();
			e.preventDefault();
		},
		selectHandler: function(e) {
			var self = this;

			// cancel event and hover styling
			this.dragHover(e);

			// fetch FileList object
			var files = e.originalEvent.dataTransfer.files;

			if ( files.length > 0 ) {

				var readFile = function(index) {
					var file = files[index];

					if ( _.isUndefined(file) ) return;

					var reader = new FileReader();

					reader.onload = function(e) {
						var b64URL = reader.result.split(',');

						var b64Content = b64URL[1].trim();
						var mime = b64URL[0].split(':')[1].split(';')[0];

						var fileHTML = $('<div class="ab1-file"><img src="/images/ab1-icon.png" /><p class="filename">' + file.name + '</p><p class="status">Uploading...</p></div>');

						$(".processed-uploads", self.$el).prepend(fileHTML);

						var contactSupport = $('<a href="javascript:void(0)">contact support</a>').click(function() {
							new SSLIMS.ContactReportPopupView();
						}).on("touchstart", function(ev) {
							new SSLIMS.ContactReportPopupView();
						});

						(new SSLIMS.FileDownload()).save({
							action: {
								method: "replace_chromatogram",
								paramz: {
									file_name: file.name,
									sheet_id: self.sheetId,
									ab1_data: b64Content
								}
							},
							mime: (mime != '') ? mime : 'application/octet-stream'
						}, {
							success: function(model) {
								if ( model.get('run_id') ) {
									$(".status", fileHTML).html("Upload Successful");
									var link = $("<a href=\"javascript:void(0);\">View Run</a>").click(function() {
										self.closeURL = "#samples/" + model.get('sample_id') + "/runs/" + model.get('run_id');
										self.hide();
									});
									
									fileHTML.append(link);
								} else {
									$(".status", fileHTML).html("Upload failed, ").append(contactSupport);
								}
								
								readFile(index + 1);
							},
							error: function(e) {
								$(".status", fileHTML).html("Upload failed, ").append(contactSupport);
								readFile(index + 1);
							}
						});
					}
					reader.readAsDataURL(file);
				};

				readFile(0);

			}

			
		},
		render: function() {
			var self = this;

			SSLIMS.loadTemplate('dashboard/sheets/upload-edited-chromatograms-popup', function(tpl) {

				// Add popup content to bg div
				self.$el.html(tpl(self));
			
				// Get popup element
				self.popup = $('.popup-reset', self.$el);

				// Add the bg & popup to document
				$('body').append(self.$el);

				// Run animations
				self.show();

			}, true);
		},
		show: function() {
			var self = this;

			// Fade in the background
			this.$el.fadeIn(200, function() {
				self.popup.slideDown(200);
			});
		},
		hide: function() {
			var self = this;

			this.popup.slideUp(200, function() {
				self.$el.fadeOut(200, function() {
					SSLIMS.unloadTemplate('dashboard/sheets/upload-edited-chromatograms-popup');
					self.remove();
					window.location.hash = self.closeURL;
				});
			});
		}
	});


	// View sheets view, render overwrites #content div in parent view
	SSLIMS.DashboardView.ViewSheetView = Backbone.View.extend({
		tagName: 'div',
		id: 'view-sheet-view',
		events: {
			'click .download-btn': 'downloadPlate',
			'click .enter-comments': 'enterComments',
			'click .send-alerts': 'sendAlerts',
			'click .sheet-data-download': 'downloadRequest',
			'click .upload-chromatograms': 'uploadChromatograms'
		},
		initialize: function(options) {
			var self = this;
			this.parent = options.parent;
			this.modelId = options.modelId;
			this.route = options.type;
			this.renderCount = 0;
			this.sampleId = options.sampleId;
			this.model = new SSLIMS.Sheet({id: this.modelId});

			this.routeMap = {
				null: 0,
				'sample': 0,
				'reactionlog': 1,
				'instrumentlog': 2,
				'comments': 3
			};

			if ( this.route != null ) {
				SSLIMS.state.changeRoute('#sheets/' + this.modelId);
			}
			
			this.updateEvent = function(ev) {
				if ( ev.model_id == self.modelId ) {
					self.sampleSheet.clearAllWells();
					self.render();
				} 
			};

			SSLIMS.collectionEvents.on('Sheet', this.updateEvent);

			this.render();
		},
		downloadRequest: function() {

			var downloadData = $('.download-data-format', this.$el).val() + '_archive';
			var downloadFormat = $('.download-format', this.$el).val();

			document.location = this.model.getDataDownload(downloadData, downloadFormat) + '?download=1';
		},
		uploadChromatograms: function() {
			new SSLIMS.UploadEditedChromatogramsPopupView({closeURL: document.location.hash, sheetId: this.modelId});
		},
		sendAlerts: function() {
			new SSLIMS.SendAlertsPopupView({closeURL: document.location.hash});
		},
		enterComments: function(callback) {
			callback = _.isFunction(callback) ? callback : function() {};

			new SSLIMS.AddRunCommentsPopupView({parent: this, samples: this.samples, wellMap: this.wellMap, onclose: callback});
		},
		downloadPlate: function() {
			this.model.downloadPlateFile();
		},
		buildSampleQuery: function() {
			var query = {$or: []};
			var wells = this.model.get('wells');

			for ( var n in wells ) {
				query['$or'].push({
					'id': wells[n]
				});
			}

			return query;
		},
		render: function() {
			var self = this;

			// Show loader here
			var loading = new SSLIMS.LoadingView({});

			SSLIMS.loadTemplate('dashboard/sheets/view-single', function(tpl) {

				(new SSLIMS.Instruments()).fetch({success: function(configs) {
					self.model.fetch({data: {revisions: 'true'}, success: function() {
						self.wellMap = _.invert(self.model.get('wells'));
					
						self.sampleTblView = new SSLIMS.TableView({
							title: 'Samples',
							collection: SSLIMS.Samples,
							query: self.buildSampleQuery(),
							fields: [
								{'Index': 'sheet_indexs.' + self.modelId},
								{'Template Name': 'name'},
								{'Well': 'sheet_indexs.' + self.modelId, 'sort': 'asc'},
								{'DNA Type': 'dna_type'},
								{'Primer': 'primer.name'},
								{'Special Request': 'special_request'},
								{'Status': 'status'},
								{'': null, tdClass: 'ui-table-btn'}
							],
							eachRow: function(model) {

								var wellIndex = self.wellMap[model.get('id')];
								
								var runs = new SSLIMS.Runs(model.get('runs'));

								var r = runs.findWhere({sheet_id: self.model.get('id')});

								if ( _.isUndefined(r) ) {
									var sampleURL = '#samples/' + model.get('id');
								} else {
									var sampleURL = '#samples/' + model.get('id') + '/runs/' + r.get('id');
								}
								

								return [model.get('sheet_indexs')[self.modelId], '<a href="#samples/' + model.get('id') + '">' + model.get('name')._() + '</a>', SSLIMS.wellIndexToName(wellIndex), model.get('dna_type')._(), model.get('primer').name._(), model.get('special_request') ? model.get('special_request')._() : 'N/A', model.get('status')._(), '<a href="' + sampleURL + '" class="ui-table-item-view glyphicon glyphicon-new-window"></a>'];
							},
							options: {
								perPage: 10,
								filter: true
							},
							buttons: [{
								value: 'Rerun Sample',
								class: 'btn-blue',
								click: function(selected) {
									var tbl = this;

									if ( selected.length > 0 ) {
										var w = new SSLIMS.EventWaiter(selected.length, function() {
											tbl.render();
											new SSLIMS.AlertView({
												msg: 'Successfully queued ' + selected.length + ' sample(s) for rerun'
											});
										});

										selected.each(function(sample) {
											sample.save('status', 'Received, ready to load', {success: function() {
												tbl.uncheckItem(sample);
												
												w.finished();
											}});
										});
									}
								}
							},{
								value: 'Edit Sheet',
								class: 'btn-green right',
								click: function(selected) {
									// if ( self.samples.hasRuns ) {
									// 	new SSLIMS.AlertView({
									// 		msg: 'You cannot edit a sheet that has already been sequenced.'
									// 	});
									// } else {
										document.location = '#sheets/' + self.modelId + '/edit';
									//}
								}
							}]
						}).render(function($el) {		
							self.sampleTblView.getAllModels(function(samples) {
								self.samples = new SSLIMS.Samples(samples);

								self.samples.each(function(s) {
									s.set('sheet_id', self.model.get('id'));

									// Get well index of sample
									var wellIndex = _.invert(self.model.get('wells'))[s.get('id')];

									// Check self.model.get('wells_config') for index
									var wellConfigID = self.model.get('wells_config')[wellIndex];
									if ( !_.isUndefined(wellConfigID) ) {
										var config = configs.get(wellConfigID);

										// Set sample config
										s.set('config', _.clone(config.attributes));
									}


									if ( s.get('runs').length > 0 && !_.isUndefined(_.find(s.get('runs'), function(r) { return r.sheet_id == self.modelId; })) ) self.samples.hasRuns = true;
								});


								self.$el.html(tpl(self));
								$('.sheet-samples', self.$el).html($el);

								SSLIMS.TabGroup($('.ui-tab-group-w-comments', self.$el), self.routeMap[self.route]);

								

								var previousRoute = SSLIMS.ls.getItem('previous_route');
								var baseRoute = '#sheets/' + self.model.get('id');

								var shouldAnimate = (previousRoute.substr(0, baseRoute.length) != baseRoute);

								var pb = $('.ui-progress-bar', self.$el);

								if ( self.renderCount == 0 && shouldAnimate ) {
									pb.animate({width: pb.attr('percentage')}, 1500);
								} else {
									pb.css('width', pb.attr('percentage'));
								}
								
								self.renderCount++;

								if ( self.route == 'reactionlog' ) {
									// Render iframe with PDF here
									$('.reaction-log', self.$el).html('<iframe class="reaction-log-iframe" src="' + self.model.getReactionLogPDF() + '"></iframe>');
								} else if ( self.route == 'instrumentlog' ) {
									$('.instrument-log', self.$el).html('<iframe class="reaction-log-iframe" src="' + self.model.getInstrumentLogPDF() + '"></iframe>');
								}


								if ( self.route == 'comments' ) new SSLIMS.DashboardView.ViewSheetCommentsView({
									samples: self.samples,
									sheet: self.model,
									parent: self
								}).render(function($el) {
									$('.sheet-comments', self.$el).html($el);
								});

								self.sampleSheet = new SSLIMS.SampleSheetView({
									wellMap: self.wellMap,
									preLoadSamples: self.samples,
									edit: false,
									parent: self
								}).render(function($el) {
									$('.sample-sheet', self.$el).html($el);

									if ( self.sampleId ) {
										var wellIndex = self.wellMap[self.sampleId];

										this.wells[parseInt(wellIndex)].showInfo();
									}

									// Hide loader here
									loading.hide();
								});
							});	

						});

						$('#content', self.parent.$el).html(self.$el);

						self.$el.on('destroyed', self.deleteView);

						self.parent.navigate([
							{name: 'Dashboard', url: 'dashboard'},
							{name: 'Sample Sheets', url: 'sheets'},
							{name: 'Sample Sheet "' + self.model.get('name') + '"', url: 'sheets/' + self.model.get('id')}
						], 'sheets');
					}});
				}});

			}, true);

		},
		deleteView: function() {
			SSLIMS.unloadTemplate('dashboard/sheets/view-single');
		}
	});

	// iOS checkin sample view, render overwrites #content div in parent view
	SSLIMS.DashboardView.iOSCheckInSampleView = Backbone.View.extend({
		tagName: 'div',
		id: 'check-in-sample-view',
		events: {
			'click .reset-scan': 'resetScanner',
			'click .checkin-all': 'checkinAll',
			'click .checkin-selected': 'checkinSelected',
			'change #camera-input': 'readQrRemote'
		},
		initialize: function(options) {
			this.parent = options.parent;
			this.route = options.type;

			if ( _.isUndefined(SSLIMS.state['scan']) ) SSLIMS.state['scan'] = {};
			this.state = SSLIMS.state['scan'];

			this.routeMap = {
				null: 0,
				'via-qr': 0,
				'via-search': 1
			};

			this.render();
		},
		readQrRemote: function(e) {
			var self = this;
			var file = $(e.target).get(0).files[0];
			var reader = new FileReader();

			reader.onload = function(e) {
				$('#photo-preview', self.$el).attr('src', reader.result);

				var b64URL = reader.result.split(',');

				var b64Content = b64URL[1].trim();
				var mime = b64URL[0].split(':')[1].split(';')[0];

				$(".wait", self.$el).html('Please wait...');

				(new SSLIMS.FileDownload()).save({
					action: {
						method: "scan_qr",
						params: {
							photo_data: b64Content,
						}
					},
					mime: mime
				}, {
					success: function(model) {
						self.state.scannedRequest = {id: model.get('request_id')};
						self.scanRequest();
						$(".wait", self.$el).html('Scan complete!');
					},
					error: function() {
						$(".wait", self.$el).html('Unable to read QR, please try again.');
					}
				});
			}
			reader.readAsDataURL(file);

		},
		resetScanner: function() {
			delete this.request;
			delete this.state.scannedRequest;
			$('.request-samples', this.$el).html('');
			$('#photo-preview', this.$el).attr('src', '');
			$('#scanned-request-info').hide();
			$(".wait", this.$el).html('Please scan a request QR Code');
		},
		checkinAll: function() {
			var self = this;
			if ( !_.isUndefined(this.request) ) {

				var validSamples = [];
				_.each(this.request.get('samples'), function(sample) {
					if ( sample.status == 'Waiting to receive' ) validSamples.push(sample);
				});

				if ( validSamples.length == 0 ) {
					new SSLIMS.AlertView({
						msg: 'No samples to check-in for this request.'
					});
				} else {
					new SSLIMS.AlertView({
						title: 'Confirm',
						msg: 'Are you sure you want to check-in ' + validSamples.length + ' sample(s)?',
						ok: function() {
							var w = new SSLIMS.EventWaiter(validSamples.length, function() {
								$('.request-samples', self.$el).html('<p style="text-align:center;margin-top:32px;">No samples to check-in</p>');
							});

							_.each(validSamples, function(s) {
								(new SSLIMS.Sample({id: s.id})).save({status: 'Received, ready to load'},{
									success: function() {
										w.finished();
									}
								});
							});
						}
					});
				}
			} else {
				new SSLIMS.AlertView({
					msg: 'You must scan a request QR code before checking in samples.'
				});
			}
		},
		checkinSelected: function() {
			var self = this;
			if ( !_.isUndefined(this.request) ) {
				var checkedSamples = $('.request-samples input:checked', this.$el);

				if ( checkedSamples.size() == 0 ) {
					new SSLIMS.AlertView({
						msg: 'Please select samples to check-in.'
					});
				} else {

					new SSLIMS.AlertView({
						title: 'Confirm',
						msg: 'Are you sure you want to check-in ' + checkedSamples.size() + ' sample(s)?',
						ok: function() {
							var w = new SSLIMS.EventWaiter(checkedSamples.size(), function() {
								checkedSamples.each(function() {
									$(this).parent().remove();
								});

								if ( $('.request-samples input', self.$el).length == 0 ) {
									$('.request-samples', self.$el).html('<p style="text-align:center;margin-top:32px;">No samples to check-in</p>');
								}
							});

							checkedSamples.each(function() {
								(new SSLIMS.Sample({id: $(this).val()})).save({status: 'Received, ready to load'},{success: function() {
									w.finished();
								}});
							});
						}
					});
				}
			} else {
				new SSLIMS.AlertView({
					msg: 'You must scan a request QR code before checking in samples.'
				});
			}
		},
		scanRequest: function(id) {
			var self = this;

			self.request = new SSLIMS.Request({id: self.state.scannedRequest.id});
			self.request.fetch({
				success: function() {
					$('#scanned-request-info').show();

					$('.request-name', self.$el).attr('href', '#requests/' + self.request.get('id')).html(self.request.get('name'));
					$('.request-date-created', self.$el).html((new Date(self.request.get('created_at'))).toLocaleString());
			
					$('.request-samples', self.$el).html('');

					if ( self.request.get('samples').length == 0 ) {
						$('.request-samples', self.$el).html('<p style="text-align:center;margin-top:32px;">No samples to check-in</p>');
					} else {
						if ( self.request.get('begun') ) {
							_.each(self.request.get('samples'), function(sample) {
								if ( sample.status == 'Waiting to receive' ) $('.request-samples', self.$el).append("<label><input type=\"checkbox\" value=\"" + sample.id + "\"><span></span> " + sample.name + " - " + sample.dna_type /* this should be replaced with primer */ + "</label>");
							});
						} else {
							$('.request-samples', self.$el).html('<p style="text-align:center;margin-top:32px;">You must begin the request in iLab before checking in samples.</p>');
						}
					}
				},
				error: function() {
					self.resetScanner();
				}
			});
		},
		render: function() {
			var self = this;

			SSLIMS.loadTemplate('dashboard/samples/checkin-ios', function(tpl) {

				self.$el.html(tpl(self));

				SSLIMS.TabGroup($('.ui-tab-group', self.$el), self.routeMap[self.route])

				
				$('#content', self.parent.$el).html(self.$el);

				if ( self.routeMap[self.route] == 0 ) {
					if ( !_.isUndefined(self.state.scannedRequest) ) self.scanRequest();



					// $('#reader', self.$el).html5_qrcode(function(data){
					// 	if ( _.isUndefined(self.request) ) {
					// 		self.state.scannedRequest = JSON.parse(data);

					// 		self.scanRequest();
					// 	}
					// }, function(error){
						
					// }, function(videoError){
						
					// });

					self.parent.navigate([
						{name: 'Dashboard', url: 'dashboard'},
						{name: 'Check-in Samples', url: 'samples/checkin'}
					]);
				} else {
					new SSLIMS.TableView({
						title: 'Check-in Request Samples',
						collection: SSLIMS.Requests,
						query: {
							begun: true
						},
						fields: [
							{'Service ID': 'name'},
							{'Customer': 'user.last_name'},
							{'Type': 'service_type'},
							{'# of Samples': 'num_samples'},
							{'Date Created': 'created_at'},
							{'Progress': null},
							{'': null, tdClass: 'ui-table-btn'}
						],
						eachRow: function(model) {
							var progressBar = model.getProgressBar();
							return ['<a href="#requests/' + model.get('id') + '">' + model.get('name')._() + '</a>', '<a href="#customers/' + model.get('user').id + '">' + model.get('user').last_name._() + ', ' + model.get('user').first_name._() + '</a>', model.get('service_type')._(), model.get('samples').length, (new Date(model.get('created_at'))).toLocaleString(), '<div class="ui-progress" style="color: ' + progressBar.textColor + ';">' + (progressBar.sequencingComplete ? 'Complete' : 'Processing') +  ' <div class="ui-progress-bar" style="width: ' + progressBar.percentage + '%;background-color: ' + progressBar.color + ';"></div></div>', '<a href="#requests/' + model.get('id') + '" class="ui-table-item-view glyphicon glyphicon-new-window"></a>'];
						},
						options: {
							perPage: 10,
							filter: true
						},
						buttons: [{
							value: 'Check-in Entire Request',
							class: 'btn-blue',
							click: function(requests) {
								if ( requests.length > 0 ) {
									var tbl = this;
									var total = 0;

									var w = new SSLIMS.EventWaiter(requests.length, function() {
										tbl.render();
										if ( total == 0 ) {
											new SSLIMS.AlertView({
												msg: 'No samples were checked in.'
											});
										} else {
											new SSLIMS.AlertView({
												msg: 'Checked in ' + total + ' sample(s).'
											});
										}
										
									});

									requests.each(function(req) {
										var w2 = new SSLIMS.EventWaiter(req.get('samples').length, function() {
											w.finished();

										});

										_.each(req.get('samples'), function(sample) {
											if ( sample.status == 'Waiting to receive' ) {
												var aSample = (new SSLIMS.Sample({id: sample.id}));

												aSample.save({status: 'Received, ready to load'}, {success: function() {
													total++;
													w2.finished();
												}});
											} else {
												w2.finished();
											}
										});

										tbl.uncheckItem(req);
									});

								}
								
							}
						},{
							value: 'Check-in Specific Samples',
							class: 'right btn-green',
							click: function(models) {
								if ( models.length > 0 ) {
									var n = 0;

									// Yo dawg, so I heard you like popup callbacks
									var openPopup = function() {
										new SSLIMS.CheckinSamplePopupView({parent: self, request: models.at(n), onclose: function() {
											if ( n != (models.length - 1) ) {
												n++;
												openPopup();
											}
										}});
									};

									openPopup();
								}
							}
						}] 
					}).render(function($el) {			
						$('.checkin-search', self.$el).prepend($el);
					});

					self.parent.navigate([
						{name: 'Dashboard', url: 'dashboard'},
						{name: 'Check-in Samples', url: 'samples/checkin'},
						{name: 'Search', url: 'samples/checkin/via-search'}
					], 'samples/checkin');
				}
			}, true);
			self.$el.on('destroyed', self.deleteView);
		},
		deleteView: function() {
			SSLIMS.unloadTemplate('dashboard/samples/checkin-ios');
		}
	});


	// checkin sample view, render overwrites #content div in parent view
	SSLIMS.DashboardView.CheckInSampleView = Backbone.View.extend({
		tagName: 'div',
		id: 'check-in-sample-view',
		events: {
			'click .reset-scan': 'resetScanner',
			'click .checkin-all': 'checkinAll',
			'click .checkin-selected': 'checkinSelected'
		},
		initialize: function(options) {
			this.parent = options.parent;
			this.route = options.type;

			if ( _.isUndefined(SSLIMS.state['scan']) ) SSLIMS.state['scan'] = {};
			this.state = SSLIMS.state['scan'];

			this.routeMap = {
				null: 0,
				'via-qr': 0,
				'via-search': 1
			};

			this.render();
		},
		resetScanner: function() {
			delete this.request;
			delete this.state.scannedRequest;
			$('.request-samples', self.$el).html('');
			$('#scanned-request-info').hide();
		},
		checkinAll: function() {
			var self = this;
			if ( !_.isUndefined(this.request) ) {

				var validSamples = [];
				_.each(this.request.get('samples'), function(sample) {
					if ( sample.status == 'Waiting to receive' ) validSamples.push(sample);
				});

				if ( validSamples.length == 0 ) {
					new SSLIMS.AlertView({
						msg: 'No samples to check-in for this request.'
					});
				} else {
					new SSLIMS.AlertView({
						title: 'Confirm',
						msg: 'Are you sure you want to check-in ' + validSamples.length + ' sample(s)?',
						ok: function() {
							var w = new SSLIMS.EventWaiter(validSamples.length, function() {
								$('.request-samples', self.$el).html('<p style="text-align:center;margin-top:32px;">No samples to check-in</p>');
							});

							_.each(validSamples, function(s) {
								(new SSLIMS.Sample({id: s.id})).save({status: 'Received, ready to load'},{
									success: function() {
										w.finished();
									}
								});
							});
						}
					});
				}
			} else {
				new SSLIMS.AlertView({
					msg: 'You must scan a request QR code before checking in samples.'
				});
			}
		},
		checkinSelected: function() {
			var self = this;
			if ( !_.isUndefined(this.request) ) {
				var checkedSamples = $('.request-samples input:checked', this.$el);

				if ( checkedSamples.size() == 0 ) {
					new SSLIMS.AlertView({
						msg: 'Please select samples to check-in.'
					});
				} else {

					new SSLIMS.AlertView({
						title: 'Confirm',
						msg: 'Are you sure you want to check-in ' + checkedSamples.size() + ' sample(s)?',
						ok: function() {
							var w = new SSLIMS.EventWaiter(checkedSamples.size(), function() {
								checkedSamples.each(function() {
									$(this).parent().remove();
								});

								if ( $('.request-samples input', self.$el).length == 0 ) {
									$('.request-samples', self.$el).html('<p style="text-align:center;margin-top:32px;">No samples to check-in</p>');
								}
							});

							checkedSamples.each(function() {
								(new SSLIMS.Sample({id: $(this).val()})).save({status: 'Received, ready to load'},{success: function() {
									w.finished();
								}});
							});
						}
					});
				}
			} else {
				new SSLIMS.AlertView({
					msg: 'You must scan a request QR code before checking in samples.'
				});
			}
		},
		scanRequest: function(id) {
			var self = this;

			self.request = new SSLIMS.Request({id: self.state.scannedRequest.id});
			self.request.fetch({
				success: function() {
					$('#scanned-request-info').show();

					$('.request-name', self.$el).attr('href', '#requests/' + self.request.get('id')).html(self.request.get('name'));
					$('.request-date-created', self.$el).html((new Date(self.request.get('created_at'))).toLocaleString());
					
					$('.request-samples', self.$el).html('');

					if ( self.request.get('samples').length == 0 ) {
						$('.request-samples', self.$el).html('<p style="text-align:center;margin-top:32px;">No samples to check-in</p>');
					} else {
						if ( self.request.get('begun') ) {
							_.each(self.request.get('samples'), function(sample) {
								if ( sample.status == 'Waiting to receive' ) $('.request-samples', self.$el).append("<label><input type=\"checkbox\" value=\"" + sample.id + "\"><span></span> " + sample.name + " - " + sample.dna_type /* this should be replaced with primer */ + "</label>");
							});
						} else {
							$('.request-samples', self.$el).html('<p style="text-align:center;margin-top:32px;">You must begin the request in iLab before checking in samples.</p>');
						}
					}

				},
				error: function() {
					self.resetScanner();
				}
			});
		},
		render: function() {
			var self = this;

			SSLIMS.loadTemplate('dashboard/samples/checkin', function(tpl) {

				self.$el.html(tpl(self));

				SSLIMS.TabGroup($('.ui-tab-group', self.$el), self.routeMap[self.route])

				
				$('#content', self.parent.$el).html(self.$el);

				if ( self.routeMap[self.route] == 0 ) {
					if ( !_.isUndefined(self.state.scannedRequest) ) self.scanRequest();

					$('#reader', self.$el).html5_qrcode(function(data){
						if ( _.isUndefined(self.request) ) {
							self.state.scannedRequest = JSON.parse(data);

							self.scanRequest();
						}
					}, function(error){
						
					}, function(videoError){
						
					});

					self.parent.navigate([
						{name: 'Dashboard', url: 'dashboard'},
						{name: 'Check-in Samples', url: 'samples/checkin'}
					]);
				} else {
					new SSLIMS.TableView({
						title: 'Check-in Request Samples',
						collection: SSLIMS.Requests,
						query: {
							begun: true
						},
						fields: [
							{'Service ID': 'name'},
							{'Customer': 'user.last_name'},
							{'Type': 'service_type'},
							{'# of Samples': 'num_samples'},
							{'Date Created': 'created_at'},
							{'Progress': null},
							{'': null, tdClass: 'ui-table-btn'}
						],
						eachRow: function(model) {
							var progressBar = model.getProgressBar();
							return ['<a href="#requests/' + model.get('id') + '">' + model.get('name')._() + '</a>', '<a href="#customers/' + model.get('user').id + '">' + model.get('user').last_name._() + ', ' + model.get('user').first_name._() + '</a>', model.get('service_type')._(), model.get('samples').length, (new Date(model.get('created_at'))).toLocaleString(), '<div class="ui-progress" style="color: ' + progressBar.textColor + ';">' + (progressBar.sequencingComplete ? 'Complete' : 'Processing') +  ' <div class="ui-progress-bar" style="width: ' + progressBar.percentage + '%;background-color: ' + progressBar.color + ';"></div></div>', '<a href="#requests/' + model.get('id') + '" class="ui-table-item-view glyphicon glyphicon-new-window"></a>'];
						},
						options: {
							perPage: 10,
							filter: true
						},
						buttons: [{
							value: 'Check-in Entire Request',
							class: 'btn-blue',
							click: function(requests) {
								if ( requests.length > 0 ) {
									var tbl = this;

									// new SSLIMS.AlertView({
									// 	title: 'Confirm',
									// 	msg: 'Are you sure you\'d like to check in ALL samples belonging to the ' + requests.length + ' selected requests?',
									// 	ok: function() {
											var total = 0;

											var w = new SSLIMS.EventWaiter(requests.length, function() {
												tbl.render();
												if ( total == 0 ) {
													new SSLIMS.AlertView({
														msg: 'No samples were checked in.'
													});
												} else {
													new SSLIMS.AlertView({
														msg: 'Checked in ' + total + ' sample(s).'
													});
												}
												
											});

											requests.each(function(req) {
												var w2 = new SSLIMS.EventWaiter(req.get('samples').length, function() {
													w.finished();

												});

												_.each(req.get('samples'), function(sample) {
													if ( sample.status == 'Waiting to receive' ) {
														var aSample = (new SSLIMS.Sample({id: sample.id}));

														aSample.save({status: 'Received, ready to load'}, {success: function() {
															total++;
															w2.finished();
														}});
													} else {
														w2.finished();
													}
												});

												tbl.uncheckItem(req);
											});
									// 	}
									// });
								}
								
							}
						},{
							value: 'Check-in Specific Samples',
							class: 'right btn-green',
							click: function(models) {
								if ( models.length > 0 ) {
									var n = 0;

									// Yo dawg, so I heard you like popup callbacks
									var openPopup = function() {
										new SSLIMS.CheckinSamplePopupView({parent: self, request: models.at(n), onclose: function() {
											if ( n != (models.length - 1) ) {
												n++;
												openPopup();
											}
										}});
									};

									openPopup();
								}
							}
						}] 
					}).render(function($el) {			
						$('.checkin-search', self.$el).prepend($el);
					});

					self.parent.navigate([
						{name: 'Dashboard', url: 'dashboard'},
						{name: 'Check-in Samples', url: 'samples/checkin'},
						{name: 'Search', url: 'samples/checkin/via-search'}
					], 'samples/checkin');
				}
			}, true);
			self.$el.on('destroyed', self.deleteView);
		},
		deleteView: function() {
			SSLIMS.unloadTemplate('dashboard/samples/checkin');
		}
	});


	SSLIMS.CheckinSamplePopupView = Backbone.View.extend({
		tagName: 'div',
		className: 'ui-popup-bg',
		events: {
			'click .ui-popup-close': 'hide',
			'click #post-comment': 'createComment'
		},
		initialize: function(options) {
			this.parent = options.parent;
			this.request = options.request;
			this.callback = options.onclose ? options.onclose : function() {};
			this.render();
		},
		render: function() {
			var self = this;

			SSLIMS.loadTemplate('dashboard/samples/popup-checkin', function(tpl) {
				
				// Add popup content to bg div
				self.$el.html(tpl(self));

				// Get popup element
				self.popup = $('.popup-reset', self.$el);

				new SSLIMS.TableView({
					title: 'Check-in Samples: ' + self.request.get('name'),
					collection: SSLIMS.Samples,
					query: {
						request_id: self.request.get('id'),
						status: 'Waiting to receive'
					},
					fields: [
						{'Template Name': 'name'},
						{'DNA Type': 'dna_type'},
						{'Primer': 'primer.name'},
						// {'Special Request': 'special_request'},
						// {'Status': 'status'},
						{'': null, tdClass: 'ui-table-btn'}
					],
					eachRow: function(model) {
						return ['<a href="#samples/' + model.get('id') + '">' + model.get('name')._() + '</a>', model.get('dna_type')._(), model.get('primer').name._(), /* model.get('special_request')._(), model.get('status')._(),*/ '<a href="#samples/' + model.get('id') + '" class="ui-table-item-view glyphicon glyphicon-new-window"></a>'];
					},
					options: {
						perPage: 10,
						filter: true,
						emptyMessage: 'No samples to check-in'
					},
					buttons: [{
						value: 'Check-in Sample',
						class: 'btn-blue',
						click: function(selected) {
							if ( selected.length > 0 ) {
								var tbl = this;

								var w = new SSLIMS.EventWaiter(selected.length, function() {
									tbl.render();
									new SSLIMS.AlertView({
										msg: 'Successfully checked in ' + selected.length + ' sample(s)'
									});
									self.hide();
								});

								selected.each(function(sample) {
									sample.save('status', 'Received, ready to load', {success: function() {
										tbl.uncheckItem(sample);
										w.finished();
									}});
								});
							}
						}
					}]
				}).render(function($el) {			
					$('.ui-popup', self.$el).append($el);
				});

				// Add the bg & popup to document
				$('body').append(self.$el);

	  			// Run animations
	  			self.show();

			});
		},
		show: function() {
			var self = this;

			// Fade in the background
			this.$el.fadeIn(200, function() {
				self.popup.slideDown(200);
			});
		},
		hide: function() {
			var self = this;

			this.popup.slideUp(200, function() {
				self.$el.fadeOut(200, function() {
					SSLIMS.unloadTemplate('dashboard/samples/popup-checkin');

					self.remove();
					self.callback();
				});
			});
		}
	});


	//  sample view, render overwrites #content div in parent view
	SSLIMS.DashboardView.ViewSamplesView = Backbone.View.extend({
		tagName: 'div',
		id: 'view-samples-view',
		initialize: function(options) {
			this.parent = options.parent;

			this.render();
		},
		render: function() {
			var self = this;

			SSLIMS.loadTemplate('dashboard/samples/view', function(tpl) {

				self.$el.html(tpl(self));
				
				$('#content', self.parent.$el).html(self.$el);

			});
			self.$el.on('destroyed', self.deleteView);
			this.parent.navigate([
				{name: 'Dashboard', url: 'dashboard'},
				{name: 'Samples', url: 'samples'}
			]);
		},
		deleteView: function() {
			SSLIMS.unloadTemplate('dashboard/samples/view');
		}
	});

	SSLIMS.CreateRunCommentView = Backbone.View.extend({
		tagName: 'div',
  		className: 'ui-popup-bg',
  		events: {
  			'click .ui-popup-close': 'hide',
  			'click #post-comment': 'createComment'
  		},
  		initialize: function(options) {
  			this.parent = options.parent;

			this.render();
  		},
  		createComment: function(ev) {
  			var self = this;
  			ev.preventDefault();

  			new SSLIMS.Comment().save({
  				message: $('#comment-value', this.$el).val(),
  				user_id: SSLIMS.user.get('id'),
  				commentable_id: this.parent.run.get('id'),
  				commentable_type: 'Run'
  			}, {success: function() {
  				self.hide();
  				self.parent.render();
  			}});
  		},
  		render: function() {
			var self = this;

  			SSLIMS.loadTemplate('dashboard/requests/popup-createcomment', function(tpl) {
				
				// Add popup content to bg div
				self.$el.html(tpl(self));

				// Get popup element
				self.popup = $('.popup-reset', self.$el);

				// Add the bg & popup to document
				$('body').append(self.$el);

	  			// Run animations
	  			self.show();

			});
  		},
  		show: function() {
  			var self = this;

  			// Fade in the background
  			this.$el.fadeIn(200, function() {
  				self.popup.slideDown(200);
  			});
  		},
  		hide: function() {
  			var self = this;

  			this.popup.slideUp(200, function() {
  				self.$el.fadeOut(200, function() {
  					SSLIMS.unloadTemplate('dashboard/requests/popup-createcomment');
  					self.remove();
  				});
  			});
  		}
	});

	//  sample view, render overwrites #content div in parent view
	SSLIMS.DashboardView.ViewSampleView = Backbone.View.extend({
		tagName: 'div',
		id: 'view-sample-view',
		events: {
			'click .chromatogram-next': 'nextChromatogram',
			'click .chromatogram-previous': 'previousChromatogram',
			'click .sample-rerun': 'rerunSample',
			'click .sample-checkin': 'checkIn',
			'click .sample-addsheet': 'addSheet',
			'click .add-comment': 'addComment',
			'click .ui-comment-delete': 'deleteComment',
			'click .sample-send-alert': 'sendAlert',
			'click .delete-run': 'deleteRun'
		},
		initialize: function(options) {
			this.parent = options.parent;
			this.modelId = options.modelId;

			this.callback = options.callback;

			this.runID = options.runID;
			this.renderCount = 0;
			this.sliderReady = true;

			this.render();
		},
		sendAlert: function() {
			document.location = '#samples/' + this.modelId + '/send_alert';
		},
		deleteRun: function() {
			var self = this;

			new SSLIMS.AlertView({
				title: 'Confirm',
				msg: 'Are you sure you want to delete this run? This action cannot be undone.',
				ok: function() {
					self.run.destroy({
						url: SSLIMS.API_URL + '/runs/' + self.run.get('id') + "?hard=true",
						success: function() {
							
							if ( document.location.hash != "#samples/" + self.modelId ) {
								document.location = "#samples/" + self.modelId;
							} else {
								self.render();
							}
						}

					});
				}
			});
		},
		deleteComment: function(e) { 
			var self = this;
			var target = $(e.target);
			var id = target.attr('data-id');

			new SSLIMS.AlertView({
				title: 'Confirm',
				msg: 'Are you sure you want to delete this comment?',
				ok: function() {
					(new SSLIMS.Comment({id: id})).destroy({
						success: function() {
							self.render();
						}
					});
				},
				context: this
			});
		},
		addSheet: function() {
			document.location = '#sheets/create';
		},
		checkIn: function() {
			var self = this;

			this.model.save({status: 'Received, ready to load'}, {success: function() {
				new SSLIMS.AlertView({
					msg: 'Sample has been checked in.'
				});
				self.render();
			}});
		},
		addComment: function() {
			new SSLIMS.CreateRunCommentView({parent: this});
		},
		nextChromatogram: function() {
			var self = this;

			if ( this.sliderReady ) {
				this.sliderReady = false;

				var c_1 = $('.c-1', this.$el);
				var c_2 = $('.c-2', this.$el);

				c_1.css('right', '-481px').css('left', '');
				c_2.css('right', '0px').css('left', '');

				if ( this.state.currentChromatogram == (this.state.numChromatograms - 1) ) {
					this.state.currentChromatogram = -1;
				}
				this.state.currentChromatogram++;

				c_1.attr('src', this.run.getSVGURL(this.state.currentChromatogram));

				c_1.animate({right: '0px'}, 1000);
				c_2.animate({right: '481px'}, {duration: 1000, complete: function() {
					c_2.attr('src', self.run.getSVGURL(self.state.currentChromatogram));
					setTimeout(function() {
						c_1.css('right', '-481px');
						c_2.css('right', '0px');

						self.sliderReady = true;
					}, 250);
					
				}});

				$('.chromatogram-current', this.$el).html(this.state.currentChromatogram + 1);
			}
			
		},
		previousChromatogram: function() {
			var self = this;

			if ( this.sliderReady ) {
				this.sliderReady = false;

				var c_1 = $('.c-1', this.$el);
				var c_2 = $('.c-2', this.$el);

				c_1.css('left', '-481px').css('right', '');
				c_2.css('left', '0px').css('right', '');

				if ( this.state.currentChromatogram == 0 ) {
					this.state.currentChromatogram = this.state.numChromatograms;
				}
				this.state.currentChromatogram--;


				c_1.attr('src', this.run.getSVGURL(this.state.currentChromatogram));

				c_1.animate({left: '0px'}, 1000);
				c_2.animate({left: '481px'}, {duration: 1000, complete: function() {
					c_2.attr('src', self.run.getSVGURL(self.state.currentChromatogram));
					setTimeout(function() {
						c_1.css('left', '-481px');
						c_2.css('left', '0px');

						self.sliderReady = true;
					}, 250);
					
				}});


				$('.chromatogram-current', this.$el).html(this.state.currentChromatogram + 1);
			}
		},
		rerunSample: function() {
			var self = this;

			new SSLIMS.AlertView({
				title: 'Confirm',
				msg: 'Are you sure you\'d like to rerun this sample?',
				ok: function() {
					self.model.save({status: 'Received, ready to load'}, {success: function() {
						self.render();
					}});
				}
			});
		},
		loadTpl: function() {
			var self = this;

			SSLIMS.loadTemplate('dashboard/samples/view-single', function(tpl) {
				
				self.$el.html(tpl(self));

				if ( self.model.get('runs').length > 0 ) SSLIMS.TabGroup($('.ui-tab-group', self.$el), self.tabMap[self.runID]);

				$('#content', self.parent.$el).html(self.$el);

				$('body, html, #content').scrollTop(0);

				var previousRoute = SSLIMS.ls.getItem('previous_route');
				var baseRoute = '#samples/' + self.model.get('id');

				var shouldAnimate = (previousRoute.substr(0, baseRoute.length) != baseRoute);

				var pb = $('.ui-progress-bar', self.$el);
				if ( self.renderCount == 0 && shouldAnimate ) {
					pb.animate({width: pb.attr('percentage')}, 1500);
				} else {
					pb.css('width', pb.attr('percentage'));
				}
				
				self.renderCount++;

				if ( !_.isUndefined(self.run) && self.run.get('ab1_file') ) {
					(new SSLIMS.FileDownload({id: self.run.get('seq_file')})).fetch({
						error: function(model, response) {
							// Have to use error since response isn't JSON
							$('.seq', self.$el).html(response.responseText);
						}
					}); 
				}

				if ( !_.isUndefined(self.run) && self.run.get('edited_ab1_file') ) {
					(new SSLIMS.FileDownload({id: self.run.get('edited_seq_file')})).fetch({
						error: function(model, response) {
							// Have to use error since response isn't JSON
							$('.seq-edited', self.$el).html(response.responseText);
						}
					}); 
				} 

				self.delegateEvents();

				if ( !_.isUndefined(self.callback) ) self.callback.call(self);
			}, true);

			self.$el.on('destroyed', self.deleteView);

			if ( SSLIMS.user.get('user_type') == 'customer' ) {
				self.parent.navigate([
					{name: 'My Requests', url: 'dashboard'},
					{name: 'Request "' + self.model.get('request').name + '"', url: 'requests/' + self.model.get('request').id},
					{name: 'Sample "' + self.model.get('name') + '"', url: 'samples/' + self.model.get('id')}
				], 'dashboard');
			} else {
				self.parent.navigate([
					{name: 'Dashboard', url: 'dashboard'},
					{name: 'Requests', url: 'requests'},
					{name: 'Request "' + self.model.get('request').name + '"', url: 'requests/' + self.model.get('request').id},
					{name: 'Sample "' + self.model.get('name') + '"', url: 'samples/' + self.model.get('id')}
				], 'requests');
			}
			
		},
		render: function() {
			var self = this;

			this.model = new SSLIMS.Sample({id: this.modelId});
			this.model.fetch({
				data: {revisions: true},
				success: function() {

					self.tabMap = {};
					_.each(self.model.get('runs'), function(r, index) {
						self.tabMap[r.id] = index;
					});

					if ( self.model.get('runs').length > 0 ) {

						if ( self.runID == null ) {
							self.runID = self.model.get('runs')[0].id;

							SSLIMS.state.changeRoute('#samples/' + self.model.get('id') + '/runs/' + self.runID);
						}

						var stateKey = 'sample_' + self.modelId + '_run_' + self.runID;

						if ( _.isUndefined(SSLIMS.state[stateKey]) ) SSLIMS.state[stateKey] = {currentChromatogram: 0};
						self.state = SSLIMS.state[stateKey];

						self.run = new SSLIMS.Run({id: self.runID});
						self.run.fetch({success: function() {
							
							var comments = [];
							
							var w = new SSLIMS.EventWaiter(self.run.get('comments').length, function() {
								if ( self.run.get('ab1_file') ) self.state.numChromatograms = self.run.get('svg_file').length;
								if ( self.run.get('edited_ab1_file') ) self.state.numChromatograms = self.run.get('edited_svg_file').length;
								
								self.run.set('comments', comments)

								self.loadTpl();
							});
							
							_.each(self.run.get('comments'), function(comment) {
								comment.user = new SSLIMS.User({id: comment.user_id});
								comment.user.fetch({
									success: function() {
										w.finished();
									}
								});

								if ( _.isUndefined(comment.deleted) ) comments.push(comment);

							});

						}});
					} else {
						self.loadTpl();
					}
					
				}
			});
		},
		deleteView: function() {
			SSLIMS.unloadTemplate('dashboard/samples/view-single');
		}
	});

	// Default dashboard view, render overwrites #content div in parent view
	SSLIMS.DashboardView.HomeScreenView = Backbone.View.extend({
		tagName: 'div',
		id: 'home-screen-view',
		events: {
			'click #finished': 'finished'
		},
		initialize: function(options) {
			this.parent = options.parent;
			
			this.render();
		},
		finished: function() {
			window.location.hash = 'settings';
		},
		render: function() {
			var self = this;

			SSLIMS.loadTemplate('dashboard/homescreen', function(tpl) {

				self.$el.html(tpl(self));
				
				$('#content', self.parent.$el).html(self.$el);
				$('body, html, #content').scrollTop(0);

			}, true);
			self.$el.on('destroyed', self.deleteView);
			this.parent.navigate([
				{name: 'Dashboard', url: 'dashboard'},
				{name: 'Account Settings', url: 'settings'},
				{name: 'Add to Home Screen', url: 'homescreen'}
			]);
		},
		deleteView: function() {
			SSLIMS.unloadTemplate('dashboard/homescreen');
		}
	});

	SSLIMS.DashboardView.AccountSettingsView = Backbone.View.extend({
		tagName: 'div',
		id: 'account-settings-view',
		events: {
			'click #add-to-home-screen': 'addToHomeScreen',
			'change #setting-auto-collapse': 'accountSave',
			'click #clear-ui-cache': 'clearUICache'
		},
		initialize: function(options) {
			this.parent = options.parent;
			this.route = options.type;

			this.routeMap = {
				null: 0,
				'account': 0,
				'contact': 1
			};

			this.render();
		},
		saveData: function(data) {
			SSLIMS.user.save(data, {
				success: function(model, response, options) {
					
				},
				error: function(model, response, options) {
					
				}
			});
		},
		clearUICache: function() {
			SSLIMS.ls.setItem('route_states', '{}');

			new SSLIMS.AlertView({
				msg: 'UI cache has been cleared'
			});
		},
		accountSave: function() {
			SSLIMS.accountSettings.auto_collapse = $('#setting-auto-collapse', this.$el).val();
			SSLIMS.accountSettings.save();
		},
		addToHomeScreen: function() {
			SSLIMS.ls.setItem('homescreen_instructions', true);
			
			window.location.hash = 'homescreen';
		},
		render: function() {
			var self = this;

			SSLIMS.loadTemplate('dashboard/account/settings', function(tpl) {
				
				self.$el.html(tpl(self));

				SSLIMS.TabGroup($('.ui-tab-group', self.$el), self.routeMap[self.route]);

				$('#content', self.parent.$el).html(self.$el);
				$('body, html, #content').scrollTop(0);
			}, true);

			self.$el.on('destroyed', self.deleteView);

			if ( SSLIMS.user.get('user_type') == 'customer' ) {
				this.parent.navigate([
					{name: 'My Requests', url: 'dashboard'},
					{name: 'Account Settings', url: 'settings'}
				], 'settings/contact');
			} else {
				this.parent.navigate([
					{name: 'Dashboard', url: 'dashboard'},
					{name: 'Account Settings', url: 'settings'}
				]);
			}

			$('#user-full-name').css('color', '#248fd3');
			$('#bread .glyphicon-cog').css('color', '#248fd3');
		},
		deleteView: function() {
			$('#user-full-name').css('color', '');
			$('#bread .glyphicon-cog').css('color', '');

			SSLIMS.unloadTemplate('dashboard/account/settings');
		}
	});

	// View requests view, render overwrites #content div in parent view
	SSLIMS.DashboardView.ViewRequestsView = Backbone.View.extend({
		tagName: 'div',
		id: 'view-requests-view',
		initialize: function(options) {
			this.parent = options.parent;
			this.render();
		},
		render: function() {
			var self = this;

			// Show loader here
			var loading = new SSLIMS.LoadingView({});

			SSLIMS.loadTemplate('dashboard/requests/view', function(tpl) {
				
				self.$el.html(tpl(self));

				var buttons = [];

				if ( SSLIMS.user.get('user_type') == 'admin' || SSLIMS.user.get('user_type') == 'staff' ) {
					buttons = [{
						value: 'Check-in Samples',
						class: 'btn-blue',
						click: function(models) {
							if ( models.length > 0 ) {
								var n = 0;

								// Yo dawg, so I heard you like popup callbacks
								var openPopup = function() {
									new SSLIMS.CheckinSamplePopupView({parent: self, request: models.at(n), onclose: function() {
										if ( n != (models.length - 1) ) {
											n++;
											openPopup();
										}
									}});
								};

								openPopup();
							}
						}
					},{
						value: 'Delete',
						class: 'right btn-red',
						click: function(models) {
							if ( models.length > 0 ) {
								var tbl = this;

								new SSLIMS.AlertView({
									title: 'Confirm',
									msg: 'Are you sure you want to delete ' + models.length + ' request(s)? This action cannot be undone.',
									ok: function() {
										var w = new SSLIMS.EventWaiter(models.length, function() {
											tbl.render();
										});

										_.each(models.models.clone(), function(request) {
											request.destroy({
												success: function() {
													w.finished();
												}
											});
										});
									}
								});
							}
						}
					}];
				}

				new SSLIMS.TableView({
					title: 'View Requests',
					collection: SSLIMS.Requests,
					query: {
						//$or: [{num_samples: 4}, {num_samples: 8}]
					},
					fields: [
						{'Service ID': 'name'},
						{'Begun?': 'begun'},
						{'Customer': 'user.last_name'},
						{'Type': 'service_type'},
						{'# Samples': null},
						{'Created': 'created_at', 'sort': 'desc'},
						{'Progress': null},
						{'': null, tdClass: 'ui-table-btn'}
					],
					eachRow: function(model) {
						var progressBar = model.getProgressBar();

						return ['<a href="#requests/' + model.get('id') + '">' + model.get('name')._() + '</a>', ((!_.isUndefined(model.get('begun')) && model.get('begun')) ? "Yes" : "No"), '<a href="#customers/' + model.get('user').id + '">' + model.get('user').last_name._() + ', ' + model.get('user').first_name._() + '</a>', model.get('service_type')._(), model.get('samples').length, (new Date(model.get('created_at'))).toLocaleDateString(), '<div class="ui-progress" style="color: ' + progressBar.textColor + ';">' + (progressBar.sequencingComplete ? 'Complete' : 'Processing') +  ' <div class="ui-progress-bar" style="width: ' + progressBar.percentage + '%;background-color: ' + progressBar.color + ';"></div></div>', '<a href="#requests/' + model.get('id') + '" class="ui-table-item-view glyphicon glyphicon-new-window"></a>'];
					},
					options: {
						perPage: 10,
						filter: true
					},
					buttons: buttons
				}).render(function($el) {			
					$('#all-requests', self.$el).append($el);
					// Hide loader here
					loading.hide();
				});


				$('#content', self.parent.$el).html(self.$el);
				$('body, html, #content').scrollTop(0);
			});

			self.$el.on('destroyed', self.deleteView);

			this.parent.navigate([
				{name: 'Dashboard', url: 'dashboard'},
				{name: 'Requests', url: 'requests'}
			]);
		},
		deleteView: function() {
			SSLIMS.unloadTemplate('dashboard/requests/view');
		}
	});

	// View request view, render overwrites #content div in parent view
	SSLIMS.DashboardView.ViewRequestView = Backbone.View.extend({
		tagName: 'div',
		id: 'view-request-view',
		events: {
			'click .ui-comment-delete': 'deleteComment',
			'click #add-comment': 'addComment',
			'click .request-download': 'downloadRequest',
			'click .send-alerts': 'sendAlerts',
			'click .delete-request': 'deleteRequest',
			'click .request-location-save': 'saveLocation'
		},
		initialize: function(options) {
			var self = this;

			this.renderCount = 0;

			this.routeMap = {
				null: 0,
				'info': 0,
				//'samples': 1,
				'scanform': 1
			};

			this.route = options.type;
			this.parent = options.parent;
			this.modelId = options.modelId;
			this.error = false;

			SSLIMS.state.changeRoute('#requests/' + options.modelId);

			this.render();

		},
		saveLocation: function() {
			this.model.save({
				location: $('#request-location', this.$el).val()
			}, {success: function() {
				new SSLIMS.AlertView({
					title: 'Success',
					msg: 'Saved request location'
				});
			}});
		},
		deleteRequest: function() {
			var self = this;
			new SSLIMS.AlertView({
				title: 'Confirm',
				msg: 'Are you sure you want to delete this request? This action cannot be undone.',
				ok: function() {
					self.model.destroy({
						success: function() {
							document.location = '#requests';
						}
					});
				}
			});
		},
		sendAlerts: function() {
			new SSLIMS.SendAlertsPopupView({closeURL: document.location.hash});
		},
		downloadRequest: function() {

			var downloadData = $('.download-data', this.$el).val() + '_archive';
			var downloadFormat = $('.download-format', this.$el).val();

			document.location = this.model.getDataDownload(downloadData, downloadFormat) + '?download=1';
		},
		addComment: function() {
			new SSLIMS.CreateRequestCommentView({parent: this});
		},
		deleteComment: function(e) {
			var self = this;
			var target = $(e.target);
			var id = target.attr('data-id');

			new SSLIMS.AlertView({
				title: 'Confirm',
				msg: 'Are you sure you want to delete this comment?',
				ok: function() {
					(new SSLIMS.Comment({id: id})).destroy({
						success: function() {
							self.render();
						}
					});
				},
				context: this
			});
		},
		loadTpl: function() {
			var self = this;

			SSLIMS.loadTemplate('dashboard/requests/view-single', function(tpl) {
				self.$el.html(tpl(self));

				var pb = $('.ui-progress-bar', self.$el);
				if ( self.renderCount == 0 ) {
					pb.animate({width: pb.attr('percentage')}, 1500);
				} else {
					pb.css('width', pb.attr('percentage'));
				}
				self.renderCount++;

				SSLIMS.TabGroup($('.ui-tab-group', self.$el), self.routeMap[self.route]);

				$('#content', self.parent.$el).html(self.$el);
				$('body, html, #content').scrollTop(0);

				if ( self.routeMap[self.route] == 1 ) {

					$('.request-scanform-iframe', self.$el).html('<iframe src="' + self.model.getScanForm() + '" id="request-scanform-iframe"></iframe>');

				} 

				var options = {
					perPage: 10,
					filter: true
				};


				var buttons = [{
					value: 'Rerun Sample',
					class: 'btn-blue',
					click: function(selected) {
						var tbl = this;

						if ( selected.length > 0 ) {
							var w = new SSLIMS.EventWaiter(selected.length, function() {
								tbl.render();
								unproccessedTbl.render();

								new SSLIMS.AlertView({
									msg: 'Successfully queued ' + selected.length + ' sample(s) for rerun'
								});
							});

							selected.each(function(sample) {
								sample.save('status', 'Received, ready to load', {success: function() {
									tbl.uncheckItem(sample);
									
									w.finished();
								}});
							});
						}
					}
				},{
					value: 'Add To Sheet',
					class: 'btn-green right',
					click: function(selected) {
						if ( selected.length > 0 ) document.location = '#sheets/create';
					}
				}];

				if ( self.model.get('begun') ){
					buttons.unshift({
						value: 'Check-in Sample',
						class: 'btn-blue',
						click: function(selected) {
							if ( selected.length > 0 ) {
								var tbl = this;

								var changeCount = 0;

								var w = new SSLIMS.EventWaiter(selected.length, function() {
									tbl.render();
									if ( changeCount == 0 ) {
										new SSLIMS.AlertView({
											msg: 'No samples were able to be checked in.'
										});
									} else {
										new SSLIMS.AlertView({
											msg: 'Successfully checked in ' + changeCount + ' sample(s)'
										});
									}
								});

								selected.each(function(sample) {
									if ( sample.get('status') == 'Waiting to receive' ) {
										sample.save('status', 'Received, ready to load', {success: function() {
											changeCount++;
											w.finished();
										}});
									} else {
										w.finished();
									}

									tbl.uncheckItem(sample);
								});
							}
						}
					});
				}

				var sequencedButtons = [{
					value: 'Rerun Sample',
					class: 'btn-blue',
					click: function(selected) {
						var tbl = this;

						if ( selected.length > 0 ) {
							var w = new SSLIMS.EventWaiter(selected.length, function() {
								tbl.render();
								unproccessedTbl.render();

								new SSLIMS.AlertView({
									msg: 'Successfully queued ' + selected.length + ' sample(s) for rerun'
								});
							});

							selected.each(function(sample) {
								sample.save('status', 'Received, ready to load', {success: function() {
									tbl.uncheckItem(sample);
									
									w.finished();
								}});
							});
						}
					}
				}];

				if ( SSLIMS.user.get('user_type') == 'customer' ) {
					options.checkBoxes = false;
					buttons = [];
					sequencedButtons = [/*{
						value: 'Download Sample Archive',
						class: 'btn-green right',
						click: function(selected) {

							selected.each(function(model) {
								var delay = 500;
								setTimeout(function() {
									document.location = model.getArchiveDownload() + '?download=1';
									delay += 500;
								}, delay);
							});
							
						}
					}*/];
				}

				var unproccessedTbl = new SSLIMS.TableView({
					title: 'Unproccessed Samples',
					collection: SSLIMS.Samples,
					query: {
						request_id: self.modelId,
						status: {$ne: 'Sequencing complete'}
					},
					fields: [
						{'Index': 'inx', 'sort': 'asc'},
						{'Template Name': 'name'},
						{'DNA Type': 'dna_type'},
						{'Primer': 'primer.name'},
						{'Special Request': 'special_request'},
						{'Status': 'status'},
						{'': null, tdClass: 'ui-table-btn'}
					],
					eachRow: function(model) {
						return [model.get('inx'), '<a href="#samples/' + model.get('id') + '">' + model.get('name')._() + '</a>', model.get('dna_type')._(), model.get('primer').name._(), (model.get('special_request') ? model.get('special_request')._() : 'N/A'), model.get('status')._(), '<a href="#samples/' + model.get('id') + '" class="ui-table-item-view glyphicon glyphicon-new-window"></a>'];
					},
					options: options,
					buttons: buttons
				}).render(function($el) {			
					$('#samples', self.$el).append($el);
				});

				new SSLIMS.TableView({
					title: 'Sequenced Samples',
					collection: SSLIMS.Samples,
					query: {
						request_id: self.modelId,
						status: 'Sequencing complete'
					},
					fields: [
						{'Index': 'inx', 'sort': 'asc'},
						{'Template Name': 'name'},
						{'DNA Type': 'dna_type'},
						{'Primer': 'primer.name'},
						{'Special Request': 'special_request'},
						{'Status': 'status'},
						{'': null, tdClass: 'ui-table-btn'}
					],
					eachRow: function(model) {
						return [model.get('inx'), '<a href="#samples/' + model.get('id') + '">' + model.get('name')._() + '</a>', model.get('dna_type')._(), model.get('primer').name._(),  (model.get('special_request') ? model.get('special_request')._() : 'N/A'), model.get('status')._(), '<a href="#samples/' + model.get('id') + '" class="ui-table-item-view glyphicon glyphicon-new-window"></a>'];
					},
					options: {
						perPage: 10,
						filter: true,
						emptyMessage: 'No samples sequenced yet'
					},
					buttons: sequencedButtons
				}).render(function($el) {		
					$('#sequenced-samples', self.$el).append($el);
				});


				// if ( SSLIMS.user.get('user_type') == 'customer' ) {
				// 	self.parent.navigate([
				// 		{name: 'My Requests', url: 'dashboard'},
				// 		{name: self.model.get('name'), url: 'requests/' + self.model.get('id')},
				// 		{name: 'Samples', url: 'requests/' + self.model.get('id') + '/samples'}
				// 	], 'dashboard');
				// } else {
				// 	self.parent.navigate([
				// 		{name: 'Dashboard', url: 'dashboard'},
				// 		{name: 'Requests', url: 'requests'},
				// 		{name: self.model.get('name'), url: 'requests/' + self.model.get('id')},
				// 		{name: 'Samples', url: 'requests/' + self.model.get('id') + '/samples'}
				// 	], 'requests');
				// }
				
			// } else {
				if ( SSLIMS.user.get('user_type') == 'customer' ) {
					self.parent.navigate([
						{name: 'My Requests', url: 'dashboard'},
						{name: 'Request "' + self.model.get('name') + '"', url: 'requests/' + self.model.get('id')}
					], 'dashboard');
				} else {
					self.parent.navigate([
						{name: 'Dashboard', url: 'dashboard'},
						{name: 'Requests', url: 'requests'},
						{name: 'Request "' + self.model.get('name') + '"', url: 'requests/' + self.model.get('id')}
					], 'requests');
				}
				
				

				
				self.delegateEvents();
			}, true);

			self.$el.on('destroyed', self.deleteView);
		},
		render: function() {
			var self = this;

			this.model = new SSLIMS.Request({
				id: this.modelId
			});

			this.model.fetch({
				success: function() {

					self.progressBar = self.model.getProgressBar();

					var comments = [];

					var w = new SSLIMS.EventWaiter(self.model.get('comments').length, function() {
						self.model.set('comments', comments)

						self.loadTpl();
					});


					_.each(self.model.get('comments'), function(comment) {
						
						comment.user = new SSLIMS.User({id: comment.user_id});
						comment.user.fetch({
							success: function() {
								w.finished();
							}
						});

						if ( _.isUndefined(comment.deleted) ) comments.push(comment);
					});
				},
				error: function() {
					self.error = true;
					self.loadTpl();
				}
			});
		},
		deleteView: function() {
			SSLIMS.unloadTemplate('dashboard/requests/view-single');
		}
	});


	SSLIMS.CreateRequestCommentView = Backbone.View.extend({
		tagName: 'div',
  		className: 'ui-popup-bg',
  		events: {
  			'click .ui-popup-close': 'hide',
  			'click #post-comment': 'createComment'
  		},
  		initialize: function(options) {
  			this.parent = options.parent;

			this.render();
  		},
  		createComment: function(ev) {
  			var self = this;
  			ev.preventDefault();

  			new SSLIMS.Comment().save({
  				message: $('#comment-value', this.$el).val(),
  				user_id: SSLIMS.user.get('id'),
  				commentable_id: this.parent.model.get('id'),
  				commentable_type: 'Request'
  			}, {success: function() {
  				self.hide();
  				self.parent.render();
  			}});

  		},
  		render: function() {
			var self = this;

  			SSLIMS.loadTemplate('dashboard/requests/popup-createcomment', function(tpl) {
				
				// Add popup content to bg div
				self.$el.html(tpl(self));

				// Get popup element
				self.popup = $('.popup-reset', self.$el);

				// Add the bg & popup to document
				$('body').append(self.$el);

	  			// Run animations
	  			self.show();

			});
  		},
  		show: function() {
  			var self = this;

  			// Fade in the background
  			this.$el.fadeIn(200, function() {
  				self.popup.slideDown(200);
  			});
  		},
  		hide: function() {
  			var self = this;

  			this.popup.slideUp(200, function() {
  				self.$el.fadeOut(200, function() {
  					SSLIMS.unloadTemplate('dashboard/requests/popup-createcomment');
  					self.remove();
  				});
  			});
  		}
	});

	// Search view, render overwrites #content div in parent view
	SSLIMS.DashboardView.SearchView = Backbone.View.extend({
		tagName: 'div',
		id: 'search-view',
		initialize: function(options) {
			this.query = options.q;
			this.parent = options.parent;
			this.render();
		},
		render: function() {
			var self = this;

			SSLIMS.loadTemplate('dashboard/search/results', function(tpl) {
				
				$('#site-search').val(self.query);

				self.$el.html(tpl(self));


				var wait = new SSLIMS.EventWaiter(3, function() {
					$('#content', self.parent.$el).html(self.$el);
					$('body, html, #content').scrollTop(0);
				});

				if ( SSLIMS.user.get('user_type') != 'customer' ) {
					new SSLIMS.TableView({
						title: 'Sample Sheets',
						collection: SSLIMS.Sheets,
						query: {},
						fields: [
							{'Plate ID': 'id2'},
							{'Name': 'name'},
							{'Creator': 'user.last_name'},
							{'# Samples': null},
							{'Instrument': 'instrument.alias'},
							{'Status': 'status'},
							{'': null, tdClass: 'ui-table-btn'}
						],
						eachRow: function(model) {
							return [model.get('id2'), '<a href="#sheets/' + model.get('id') + '">' + model.get('name')._() + '</a>', '<a href="#staff/' + model.get('user').id + '">' + model.get('user').last_name._() + ', ' + model.get('user').first_name._() + '</a>', Object.keys(model.get('wells')).length, model.get('instrument').alias._(), model.get('status')._(), '<a href="#sheets/' + model.get('id') + '" class="ui-table-item-view glyphicon glyphicon-new-window"></a>'];
						},
						options: {
							perPage: 10,
							filter: true,
							emptyMessage: 'No sheets found'
						},
					}).render(function($el) {	
						$('.ui-table .search', $el).val(self.query).keyup();		
						$('#sheets', self.$el).html($el);
						wait.finished();
					});

					new SSLIMS.TableView({
						title: 'User Accounts',
						collection: SSLIMS.Users,
						query: {
							user_type: {'$ne': 'data_client'}
						},
						fields: [
							{'Type': 'user_type'},
							{'First Name': 'first_name'},
							{'Last Name': 'last_name'},
							{'Email': 'email'},
							{'Status': 'status'},
							{'Date Created': 'created_at'},
							{'': null, tdClass: 'ui-table-btn'}
						],
						eachRow: function(model) {
							return [model.get('user_type').capitalize()._(), model.get('first_name')._(), model.get('last_name')._(), model.get('email')._(), model.get('status').capitalize()._(), (new Date(model.get('created_at'))).toLocaleString(), '<a href="#users/' + model.get('id') + '/edit" class="ui-table-item-view glyphicon glyphicon-pencil"></a>'];
						},
						options: {
							perPage: 5,
							filter: true,
							emptyMessage: 'No user accounts found'
						}
						
					}).render(function($el) {
						$('.ui-table .search', $el).val(self.query).keyup();
						$('#users', self.$el).html($el);
						wait.finished();
					});


				} else {
					wait.finished();
					wait.finished();
				}

				var requestTbl = new SSLIMS.TableView({
					title: 'View Requests',
					collection: SSLIMS.Requests,
					query: {},
					fields: [
						{'Service ID': 'name'},
						{'Customer': 'user.last_name'},
						{'Type': 'service_type'},
						{'# Samples': null},
						{'Date Created': 'created_at'},
						{'Progress': null},
						{'': null, tdClass: 'ui-table-btn'}
					],
					eachRow: function(model) {
						var progressBar = model.getProgressBar();

						return ['<a href="#requests/' + model.get('id') + '">' + model.get('name')._() + '</a>', '<a href="#customers/' + model.get('user').id + '">' + model.get('user').last_name._() + ', ' + model.get('user').first_name._() + '</a>', model.get('service_type')._(), model.get('samples').length, (new Date(model.get('created_at'))).toLocaleDateString(), '<div class="ui-progress" style="color: ' + progressBar.textColor + ';">' + (progressBar.sequencingComplete ? 'Complete' : 'Processing') +  ' <div class="ui-progress-bar" style="width: ' + progressBar.percentage + '%;background-color: ' + progressBar.color + ';"></div></div>', '<a href="#requests/' + model.get('id') + '" class="ui-table-item-view glyphicon glyphicon-new-window"></a>'];
					},
					options: {
						perPage: 10,
						filter: true,
						emptyMessage: 'No requests found'
					},
				}).render(function($el) {	
					$('.ui-table .search', $el).val(self.query).keyup();			
					$('#requests', self.$el).html($el);
					
					wait.finished();
				});

				new SSLIMS.TableView({
					title: 'Samples',
					collection: SSLIMS.Samples,
					query: {},
					fields: [
						{'Template Name': 'name'},
						{'DNA Type': 'dna_type'},
						{'Primer': 'primer.name'},
						{'Special Request': 'special_request'},
						{'Status': 'status'},
						{'': null, tdClass: 'ui-table-btn'}
					],
					eachRow: function(model) {
						return ['<a href="#samples/' + model.get('id') + '">' + model.get('name')._() + '</a>', model.get('dna_type')._(), model.get('primer').name._(),  (model.get('special_request') ? model.get('special_request')._() : 'N/A'), model.get('status')._(), '<a href="#samples/' + model.get('id') + '" class="ui-table-item-view glyphicon glyphicon-new-window"></a>'];
					},
					options: {
						perPage: 10,
						filter: true,
						emptyMessage: 'No samples found'
					}
				}).render(function($el) {		
					$('.ui-table .search', $el).val(self.query).keyup();
					$('#samples', self.$el).html($el);
					wait.finished();
				});

				// Samples

				// Instruments


			}, true);

			self.$el.on('destroyed', self.deleteView);

			$("#site-search").css('border', '1px solid #248fd3');

			this.parent.navigate([
				{name: 'Dashboard', url: 'dashboard'},
				{name: 'Search', url: 'search'}
			]);
			
		},
		deleteView: function() {
			$("#site-search").css('border', '');

			SSLIMS.unloadTemplate('dashboard/search/results');
		}
	});

	// Alerts view, render appends to #container div in parent view
	SSLIMS.DashboardView.AlertsView = Backbone.View.extend({
		tagName: 'div',
		id: 'alerts',
		initialize: function(options) {
			this.parent = options.parent;

			var self = this;

			// Add handler for displayAlert
			SSLIMS.events.on('DashboardAlert', function(ev) {
				self.addAlert(ev.get('event_object').message, ev.get('event_object').level, ev);
			});

			this.render();
		},
		render: function() {
			$('#container', this.parent.$el).append(this.$el);

			this.checkFullScreen();

			return this.$el;
		},
		checkFullScreen: function() {
			if ( SSLIMS.iOS() && !SSLIMS.isFullScreen() ) {

				var a = $('<a href="javascript:void(0);">add SSLIMS to your home screen</a>').click(function() {
					SSLIMS.ls.setItem('homescreen_instructions', true);
					window.location.hash = 'homescreen';
					alert.dismissAlert();
				});

				var alert = new SSLIMS.DashboardView.AlertsView.Alert({
					parent: this.$el,
					level: 'warn',
					message: $('<span>You appear to be running iOS. Please </span>').append(a)
				});

			}
		},
		addAlert: function(message, level, ev) {
			
			var alert = new SSLIMS.DashboardView.AlertsView.Alert({
				parent: this.$el,
				level: level,
				message: message,
				ev: ev
			});

			return alert;

		}
	});

	SSLIMS.DashboardView.AlertsView.Alert = Backbone.View.extend({
		tagName: 'div',
		events: {
			'click .dismiss-alert': 'dismissAlert'
		},
		initialize: function(options) {
			this.parent = options.parent;
			this.ev = options.ev;

			switch ( options.level ) {
				case 'warn':
					var color = 'yellow';
					break;
				case 'error':
					var color = 'red';
					break;
				case 'info':
				default: 
					var color = 'green';
			}

			this.$el
				.html('<div class="dismiss-alert glyphicon glyphicon-remove"></div><div class="alert-' + color + '-triangle"></div>')
				.addClass('alert-' + color)
				.prepend(options.message);

			this.render();
		},
		render: function() {
			var self = this;

			this.parent.append(this.$el);
			this.$el.slideDown('fast', function() {
				if ( !_.isUndefined(self.ev) && !self.ev.get('persist') ) self.dismissEvent();
			});

			return this.$el;
		},
		dismissEvent: function() {
			if ( !_.isUndefined(this.ev) ) this.ev.delivered();
		},
		dismissAlert: function() {
			var self = this;

			if ( !_.isUndefined(self.ev) && self.ev.get('persist') ) self.dismissEvent();

			this.$el.slideUp('fast', function() {
				self.$el.remove();
			});
		}
	});

}(window.SSLIMS = window.SSLIMS || {}, jQuery));