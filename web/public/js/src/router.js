(function(SSLIMS, $, undefined) {

	// Init settings storage
	SSLIMS.accountSettings = new SSLIMS.LocalStorageObject('account_settings');

	// Delegates application routes using the document hash
	SSLIMS.Router = Backbone.Router.extend({
		routes: {
			'': 'index',
			'docs': 'documentation',
			'disabled': 'disabled',
			'request_account': 'requestAccount',
			'dashboard': 'dashboard',
			'dashboard/alerts': 'dashboardAlerts',
			'requests': 'requests',
			'requests/create': 'requestsCreate',
			'requests/:id(/:type)': 'requestsView',
			'samples/checkin(/:type)': 'samplesCheckIn',
			'samples': 'samples',
			'samples/:id/send_alert': 'samplesAlertView',
			'samples/:id(/runs/:type)': 'samplesView',
			'sheets': 'sheets',
			'sheets/:id/edit': 'sheetsEdit',
			'sheets/create(/:type)': 'sheetsCreate',
			'sheets/:id(/:type)': 'sheetsView',
			'sheets/:id(/:type/:sample_id)': 'sheetsView',
			'alerts(/:id/:type)': 'alerts',
			'alerts/create': 'alertsCreate',
			'alerts/send': 'alertsSend',
			'config/:resource/create': 'configCreate',
			'config/:resource/:id/edit': 'configEdit',
			'config(/:resource/:id)': 'configView',
			'users': 'users',
			'users/:id/edit': 'editAccount',
			'accountrequest/:id/approve': 'approveAccount',
			'search:query': 'search',
			'settings(/:type)': 'settings',
			'homescreen': 'homescreen'
		},
		setupDashboard: function(callback) {
			if ( SSLIMS.isGuest ) {
				window.location.hash = 'request_account';
			} else if ( !_.isUndefined(SSLIMS.isDisabled) ) {
				window.location.hash = 'disabled';
			} else {
				if ( _.isUndefined(SSLIMS.dashboard) ) {
					SSLIMS.dashboard = new SSLIMS.DashboardView({
						toggleNav: !(SSLIMS.accountSettings.auto_collapse == 'Yes'),
						renderComplete: function(self) {
							callback(self);
						}
					});
				} else {
					callback(SSLIMS.dashboard);
					if ( SSLIMS.accountSettings.auto_collapse == 'Yes' ) SSLIMS.dashboard.collapseNavigation();
				}
			}
		},
		index: function() {
			// Is the user logged in?
			if ( SSLIMS.isGuest ) {
				window.location.hash = 'request_account';
			} else if ( !_.isUndefined(SSLIMS.isDisabled) ) {
				window.location.hash = 'disabled';
			} else {
				window.location.hash = 'dashboard';
			}
		},
		documentation: function() {
			document.title = 'Help & Documentation // SSLIMS';

			this.setupDashboard(function(dashboard) {
				new SSLIMS.DashboardView.DocumentationView({parent: dashboard});
			});
		},
		disabled: function() {
			if ( !_.isUndefined(SSLIMS.isDisabled) ) {
				document.title = 'Account Disabled // SSLIMS';

				new SSLIMS.DisabledAccountView({
					user: SSLIMS.disabledUser
				});
			} else {
				window.location.hash = 'dashboard';
			}
		},
		requestAccount: function() {
			if ( SSLIMS.isGuest ) {
				document.title = 'Request Account // SSLIMS';

				new SSLIMS.RequestAccountView({
					user: SSLIMS.guestUser
				});
			} else {
				window.location.hash = 'dashboard';
			}
		},
		users: function() {
			document.title = 'View Users // SSLIMS';

			this.setupDashboard(function(dashboard) {
				new SSLIMS.DashboardView.ViewUsersView({parent: dashboard});
			});
		},
		editAccount: function(id) {
			document.title = 'Edit Account // SSLIMS';

			this.setupDashboard(function(dashboard) {

				SSLIMS.state.changeRoute('#users');

				new SSLIMS.DashboardView.ViewUsersView({parent: dashboard, callback: function() {
					new SSLIMS.User({id: id}).fetch({
						success: function(model) {
							if ( $('.popup-edituser').length == 0 ) new SSLIMS.EditUserView({
								userModel: model
							});
						}
					});
				}});
			});
		},
		approveAccount: function(id) {
			document.title = 'Approve Account // SSLIMS';

			this.setupDashboard(function(dashboard) {
				new SSLIMS.DashboardView.ViewUsersView({parent: dashboard, callback: function() {
					new SSLIMS.AccountRequest({id: id}).fetch({
						success: function(model) {
							if ( $('.popup-approveaccount').length == 0 ) new SSLIMS.ApproveAccountRequestView({
								requestModel: model
							});
						}
					});
				}});
			});
		},
		requestsView: function(id, type) {
			document.title = 'View Request // SSLIMS';

			this.setupDashboard(function(dashboard) {
				new SSLIMS.DashboardView.ViewRequestView({parent: dashboard, modelId: id, type: type});
			});
		},
		configView: function(resource, id) {
			document.title = 'Configuration Settings // SSLIMS';

			this.setupDashboard(function(dashboard) {
				SSLIMS.state.changeRoute('#config');
				new SSLIMS.DashboardView.ViewConfigView({parent: dashboard, id: id});
			});
		},
		configCreate: function(resource, id) {
			document.title = 'Configuration Settings // SSLIMS';

			this.setupDashboard(function(dashboard) {

				var urlSegs = SSLIMS.ls.getItem('last_route').split('/');
				var lastSeg = _.last(urlSegs);

				SSLIMS.state.changeRoute('#config');

				new SSLIMS.DashboardView.ViewConfigView({parent: dashboard, id: (urlSegs[1] == 'instrument') ? lastSeg : null, callback: function() {

					if ( urlSegs[2] && id != urlSegs[2] ) {
						var closeURL = '#config/instrument/' + urlSegs[2];
					} else {
						var closeURL = '#config';
					}
					

					if ( resource == 'control-samples' ) {
						new SSLIMS.CreateControlSampleView({closeURL: closeURL});
					} else if ( resource == 'instruments' ) {
						new SSLIMS.CreateInstrumentView({closeURL: closeURL});
					} else {
						new SSLIMS.CreatePrimerView({closeURL: closeURL});
					}
				}});
			});
		},
		configEdit: function(resource, id) {
			document.title = 'Configuration Settings // SSLIMS';

			this.setupDashboard(function(dashboard) {

				var urlSegs = SSLIMS.ls.getItem('last_route').split('/');
				var lastSeg = _.last(urlSegs);

				SSLIMS.state.changeRoute('#config');

				new SSLIMS.DashboardView.ViewConfigView({parent: dashboard, id: (urlSegs[1] == 'instrument') ? lastSeg : null, callback: function() {

					if ( urlSegs[2] && id != urlSegs[2] ) {
						var closeURL = '#config/instrument/' + urlSegs[2];
					} else {
						var closeURL = '#config';
					}
					

					if ( resource == 'control-samples' ) {
						new SSLIMS.EditControlSampleView({closeURL: closeURL, modelId: id});
					} else {
						new SSLIMS.EditPrimerView({closeURL: closeURL, modelId: id});
					}

				}});
			});
		},
		alertsCreate: function(id, type) {
			document.title = 'Create Alert Template // SSLIMS';

			this.setupDashboard(function(dashboard) {
				SSLIMS.state.changeRoute('#alerts');
				new SSLIMS.DashboardView.ViewAlertsView({parent: dashboard, modelId: id, type: type, create: true});
			});
		},
		alertsSend: function() {
			document.title = 'Send Alert Templates // SSLIMS';

			this.setupDashboard(function(dashboard) {
				new SSLIMS.DashboardView.SendAlertsView({parent: dashboard});
			});
		},
		alerts: function(id, type) {
			document.title = 'View Alert Templates // SSLIMS';

			this.setupDashboard(function(dashboard) {
				SSLIMS.state.changeRoute('#alerts');
				new SSLIMS.DashboardView.ViewAlertsView({parent: dashboard, modelId: id, type: type});
			});
		},
		sheetsEdit: function(sheet_id) {
			document.title = 'Edit Sheet // SSLIMS';

			this.setupDashboard(function(dashboard) {
				new SSLIMS.DashboardView.EditSheetView({parent: dashboard, sheet_id: sheet_id});
			});
		},
		sheetsCreate: function(type) {
			document.title = 'Create Sheet // SSLIMS';

			this.setupDashboard(function(dashboard) {
				new SSLIMS.DashboardView.CreateSheetView({parent: dashboard, type: type});
			});
		},
		sheets: function() {
			document.title = 'View Sheets // SSLIMS';

			this.setupDashboard(function(dashboard) {
				new SSLIMS.DashboardView.ViewSheetsView({parent: dashboard});
			});
		},
		sheetsView: function(id, type, sampleId) {
			document.title = 'View Sheet // SSLIMS';

			this.setupDashboard(function(dashboard) {
				new SSLIMS.DashboardView.ViewSheetView({parent: dashboard, modelId: id, type: type, sampleId: sampleId});
			});
		},
		search: function() {
			document.title = 'Search // SSLIMS';

			this.setupDashboard(function(dashboard) {
				new SSLIMS.DashboardView.SearchView({
					q: SSLIMS.parseQuery().q,
					parent: dashboard
				});
			});
		},
		dashboardAlerts: function() {
			document.title = 'View Dismissed Alerts // SSLIMS';

			this.setupDashboard(function(dashboard) {
				new SSLIMS.DashboardView.ViewDashboardAlertsView({parent: dashboard});
			});
		},
		dashboard: function() {
			document.title = 'Dashboard // SSLIMS';

			this.setupDashboard(function(dashboard) {
				new SSLIMS.DashboardView.DefaultDashboardView({parent: dashboard});
			});
		},
		requests: function() {
			document.title = 'View Requests // SSLIMS';

			this.setupDashboard(function(dashboard) {
				new SSLIMS.DashboardView.ViewRequestsView({parent: dashboard});
			});
		},
		samples: function() {
			document.title = 'View Samples // SSLIMS';

			this.setupDashboard(function(dashboard) {
				new SSLIMS.DashboardView.ViewSamplesView({parent: dashboard});
			});
		},
		samplesAlertView: function(id, type) {
			document.title = 'View Sample // SSLIMS';

			this.setupDashboard(function(dashboard) {

				var urlSegs = SSLIMS.ls.getItem('last_route').split('/');
				var lastSeg = _.last(urlSegs);

				var closeURL;

				if ( urlSegs.length > 2 && urlSegs[2] != 'send_alert' ) {
					closeURL = '#samples/' + id + '/runs/' + lastSeg;
					type = lastSeg;
				} else {
					closeURL = '#samples/' + id;
				}

				SSLIMS.state.changeRoute(closeURL);

				new SSLIMS.DashboardView.ViewSampleView({parent: dashboard, modelId: id, runID: type, callback: function() {
					new SSLIMS.SendAlertsPopupView({closeURL: closeURL});
				}});
			});
		},
		samplesView: function(id, type) {
			document.title = 'View Sample // SSLIMS';

			this.setupDashboard(function(dashboard) {
				new SSLIMS.DashboardView.ViewSampleView({parent: dashboard, modelId: id, runID: type});
			});
		},
		samplesCheckIn: function(type) {
			document.title = 'Check-in Samples // SSLIMS';

			this.setupDashboard(function(dashboard) {
				// Use JS based QR reader if it isn't iOS
				if ( SSLIMS.iOS() ) {
					new SSLIMS.DashboardView.iOSCheckInSampleView({parent: dashboard, type: type});
				} else {
					new SSLIMS.DashboardView.CheckInSampleView({parent: dashboard, type: type});
				}
			});
		},
		requestsCreate: function() {
			document.title = 'Create Request // SSLIMS';

			this.setupDashboard(function(dashboard) {
				new SSLIMS.DashboardView.CreateRequestView({parent: dashboard});
			});
		},
		settings: function(type) {
			document.title = 'Account Settings // SSLIMS';

			this.setupDashboard(function(dashboard) {
				new SSLIMS.DashboardView.AccountSettingsView({parent: dashboard, type: type});
			});
		},
		homescreen: function() {
			// Render add bookmark view, or forward users to the last page if 

			// Was this page request through the UI?
			if ( SSLIMS.ls.getItem('homescreen_instructions') == 'true' ) {

				// Reset so the following requests will be redirected
				SSLIMS.ls.setItem('homescreen_instructions', null);

				// Title to be used on homescreen icon
				document.title = 'SSLIMS';
				
				this.setupDashboard(function(dashboard) {
					new SSLIMS.DashboardView.HomeScreenView({parent: dashboard});
				});

			} else {
				window.location.hash = (SSLIMS.ls.getItem('last_route') == '#homescreen' || SSLIMS.ls.getItem('last_route') == null) ? '#dashboard' : SSLIMS.ls.getItem('last_route');
			}
		},
		route: function(route, name, callback) {
			var router = this;
			if ( !callback ) callback = this[name];

			var f = function() {

				if ( !_.isUndefined(SSLIMS.state) ) SSLIMS.state.save();

				SSLIMS.state = new SSLIMS.routeState();

				callback.apply(router, arguments);

				SSLIMS.pageChange();
			};
			return Backbone.Router.prototype.route.call(this, route, name, f);
		}
	});

	SSLIMS.init_guest = function(user) {
		user = JSON.parse(Base64.decode(user));

		this.isGuest = true;

		this.guestUser = user;

		new SSLIMS.Router();
		Backbone.history.start();
	};

	SSLIMS.init_disabled = function(user) {
		user = JSON.parse(Base64.decode(user));

		this.isGuest = false;
		this.isDisabled = true;

		this.disabledUser = user;

		new SSLIMS.Router();
		Backbone.history.start();
	};

	// Runs once when application loads, this is the starting point
	SSLIMS.init = function(user) {
		user = JSON.parse(Base64.decode(user));

		this.isGuest = false;

		this.setAuth(user.email, user.client_api_key);

		// Init current user model
		this.user = new this.User({
			id: 'me'
		});
		
		// Redirect if needed using last route varaible in local storage
		this.redirectIfNeeded();

		// Get current user data
		this.user.fetch({success: function() {
			new SSLIMS.Router();
			Backbone.history.start();
			
			// Create event delegator object and event collection, bind add method
			SSLIMS.setupRestEvents();
		}});
	};

	SSLIMS.setupRestEvents = function() {

		// Define event collection
		this.eventCollection = new SSLIMS.Events();
		
		// Extend backbone event class
		this.events = _.extend({}, Backbone.Events);
		this.collectionEvents = _.extend({}, Backbone.Events);

		this.events.on('CollectionUpdate', function(ev) {
			this.collectionEvents.trigger(ev.get('event_object').name, ev.get('event_object'));
			ev.delivered();
		}, this);

		// When an event is added to the collection
		this.eventCollection.on('add', function(ev) {
			var now = Date.now() / 1000;
			var event_time = Date.parse(ev.get('created_at')) / 1000;

			// Set the event to delivered if it's only than a minute and isn't set to persist
			if ( !ev.get('persist') && ((now - event_time) > 120) ) {
				ev.delivered();
			} else {
				// Trigger the event handler
				SSLIMS.events.trigger(ev.get('event_object')._type, ev);
			}
		});

		// Bind global application events
		this.bindEvents();

		this.startEventListener();

	};

	SSLIMS.startEventListener = function() {
		if ( _.isUndefined(this.eventInterval) ) {

			var intervalDuration = 5000;
			var timePast = 0;

			var fetchEvents = function() {

				timePast += intervalDuration;

				// Fetch the events that have not been develivered
				SSLIMS.eventCollection.fetch({
					data: {
						join: false,
						query: Base64.encode(JSON.stringify({
							delivered: false
						}))
					}
				});

				// Check to see if shib session is still valid every 5 minutes
				if ( timePast >= 300000 ) {
					if ( !SSLIMS.user.get('url_auth') ) $.ajax({
						type: 'GET',
						url: '/verify-shib',
						error: function() {
							location.reload(true);
						}
					});

					timePast = 0;
				}

				SSLIMS.state.save();
			};

			// Poll every 5 seconds for updates
			this.eventInterval = setInterval(fetchEvents, intervalDuration);
		}
	};

	SSLIMS.bindEvents = function() {

		// When the user has been loaded set a property that can be read on new route
		this.user.on('sync', function() {
			if ( SSLIMS.user.get('status') == 'disabled' ) location.reload(true);
			if ( !_.isUndefined(SSLIMS.user.previous('user_type')) && SSLIMS.user.previous('user_type') != SSLIMS.user.get('user_type') ) location.reload(true);
		});

		// When a user has his info change midsession, logout
		this.eventCollection.on('error', function(coll, response) {
			
			// Did the network connection fail?
			if ( response.readyState == 0 ) {
				console.log('Network connection failed.');
			} else {
				location.reload(true);
			}
			
		});

		$(window).on('beforeunload', function() {
			SSLIMS.state.save();
		});


		this.collectionEvents.on('User', function(ev) {
			SSLIMS.user.fetch();
		});

	};

	// Set username and hashed password in local storage for use in authenticating requests
	SSLIMS.setAuth = function(email, client_api_key) {
		document.cookie = "sslims_auth=" + client_api_key + ";path=/;domain=." + SSLIMS.WEB_HOST;

		this.ls.setItem('email', email);
		this.ls.setItem('client_api_key', client_api_key);
	};

	SSLIMS.redirectIfNeeded = function() {
		// Forward user to last used page
		if ( !_.isNull(this.ls.getItem('last_route')) && window.location.hash == '' ) window.location.hash = this.ls.getItem('last_route');
	};

}(window.SSLIMS = window.SSLIMS || {}, jQuery));