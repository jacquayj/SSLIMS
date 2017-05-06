(function(SSLIMS, $, undefined) {

	// Define user model
	SSLIMS.User = Backbone.Model.extend({
		name: 'User',
		urlRoot: SSLIMS.API_URL + '/users',
		getGravitarURL: function() {
			return 'https://www.gravatar.com/avatar/' + CryptoJS.MD5(this.get('email').trim().toLowerCase()) + '?s=60';
		},
		parse: function(response) {
			if ( response.result ) {
				return response.result.data;
			}

			return response;
		}
	});

	// Define users collection
	SSLIMS.Users = Backbone.Collection.extend({
		model: SSLIMS.User,
		url: SSLIMS.API_URL + '/users',
		parse: function(response) {
			return response.result.data;  
		}
	});

	// Define Instrument model
	SSLIMS.Instrument = Backbone.Model.extend({
		name: 'Instrument',
		urlRoot: SSLIMS.API_URL + '/instruments',
		getPhotoURL: function() {
			return SSLIMS.API_URL + '/files/' + this.get('photo_file');
		},
		parse: function(response) {
			if ( response.result ) {
				return response.result.data;
			}

			return response;
		}
	});

	// Define Instrument collection
	SSLIMS.Instruments = Backbone.Collection.extend({
		model: SSLIMS.Instrument,
		url: SSLIMS.API_URL + '/instruments',
		parse: function(response) {
			return response.result.data;  
		}
	});


	// Define Primer model
	SSLIMS.Primer = Backbone.Model.extend({
		name: 'Primer',
		urlRoot: SSLIMS.API_URL + '/primers',
		parse: function(response) {
			if ( response.result ) {
				return response.result.data;
			}

			return response;
		}
	});

	// Define Primer collection
	SSLIMS.Primers = Backbone.Collection.extend({
		model: SSLIMS.Primer,
		url: SSLIMS.API_URL + '/primers',
		parse: function(response) {
			return response.result.data;  
		}
	});

	// Define Sheet model
	SSLIMS.Sheet = Backbone.Model.extend({
		name: 'Sheet',
		urlRoot: SSLIMS.API_URL + '/sheets',
		getProgressBar: function() {
			return ({
				'Waiting to be sequenced': {
					percentage: 10,
					color: '#f35e5e',
					fontColor: '#858589'
				},
				'Sequencing initiated': {
					percentage: 50,
					color: '#f2c779',
					fontColor: '#858589'
				},
				'Sequencing complete': {
					percentage: 100,
					color: '#00ce9b',
					fontColor: '#FFF'
				}
			})[this.get('status')];
		},
		downloadPlateFile: function() {
			document.location = SSLIMS.API_URL + '/files/' + this.get('plt_file') + '?download=1';
		},
		getReactionLogPDF: function(index) {
			return SSLIMS.API_URL + '/files/' + this.get('reactionlog_file');
		},
		getInstrumentLogPDF: function(index) {
			return SSLIMS.API_URL + '/files/' + this.get('instrumentlog_file');
		},
		getDataDownload: function(downloadData, downloadFormat) {
			return SSLIMS.API_URL + '/files/' + this.get(downloadData)[downloadFormat];
		},
		joinSamples: function(callback) {
			var self = this;
			var wells = this.get('wells');
			var sampleQuery = {$or: []};

			for ( var n in wells ) {
				var sampleId = wells[n];

				sampleQuery.$or.push({
					id: sampleId
				});
			}

			(new SSLIMS.Samples()).fetch({data: {
				query: Base64.encode(JSON.stringify(sampleQuery)),
				limit: 96
			}, success: function(collection) {
				self.set('well_samples', collection);
				callback.call(self);
			}});
		},
		getPrettyRevisionList: function() {
			var self = this;

			if ( !_.isUndefined(this.get('_revisions')) ) {
				var prettyRevisions = [];

				var revisions = this.get('_revisions');
			
				_.each(revisions, function(rev, index) {
					
					var msgString = '';
					
					for ( var field in rev.data ) {
						
						var before;
						var after;

						var data = rev.data[field];

						// Is this the last revision field?
						if ( _.isUndefined(revisions[index + 1]) || _.isUndefined(revisions[index + 1].data[field]) ) {
							before = data;

							// Use the current val for after
							after = self.get(field);
						} else {
							before = data;
							after = revisions[index + 1].data[field];
						}

						if ( _.isObject(before) || _.isObject(after) ) {
							msgString += " - " + field.capitalize() + ' changed<br />';
						} else {
							msgString += " - " + field.capitalize() + ' changed from "' + before + '" to "' + after + '"<br />';
						}
					
					}

					prettyRevisions.push({
						createdAt: (new Date(rev.created_at)).toLocaleString(),
						msg: msgString
					});

				});

				return prettyRevisions.reverse();
			}

			return [];
		},
		parse: function(response) {
			if ( response.result ) {
				return response.result.data;
			}

			return response;
		}
	});

	// Define Sheet collection
	SSLIMS.Sheets = Backbone.Collection.extend({
		model: SSLIMS.Sheet,
		url: SSLIMS.API_URL + '/sheets',
		parse: function(response) {
			return response.result.data;  
		}
	});


	// Define Comment model
	SSLIMS.Comment = Backbone.Model.extend({
		name: 'Comment',
		urlRoot: SSLIMS.API_URL + '/comments',
		parse: function(response) {
			if ( response.result ) {
				return response.result.data;
			}

			return response;
		}
	});

	// Define Comment collection
	SSLIMS.Comments = Backbone.Collection.extend({
		model: SSLIMS.Comment,
		url: SSLIMS.API_URL + '/comments',
		parse: function(response) {
			return response.result.data;  
		}
	});

	// Define Sample model
	SSLIMS.Sample = Backbone.Model.extend({
		name: 'Sample',
		urlRoot: SSLIMS.API_URL + '/samples',
		getProgressBar: function() {
			return ({
				'Waiting to receive': {
					percentage: 25,
					color: '#f35e5e',
					fontColor: '#858589'
				},
				'Received, ready to load': {
					percentage: 50,
					color: '#f2c779',
					fontColor: '#858589'
				},
				'Loaded, ready for sequencing': {
					percentage: 75,
					color: '#f2c779',
					fontColor: '#FFF'
				},
				'Sequencing complete': {
					percentage: 100,
					color: '#00ce9b',
					fontColor: '#FFF'
				}
			})[this.get('status')];
		},
		getArchiveDownload: function() {
			//
		},
		getCheckInDate: function() {
			var self = this;

			var chkInDate = null;

			var revisions = this.get('_revisions');

			if ( !_.isUndefined(revisions) ) {
				revisions = _.clone(revisions).reverse();
				_.each(revisions, function(revision, index) {
					if ( !_.isUndefined(revision.data) && revision.data.status == 'Waiting to receive' ) {
						chkInDate = new Date(revision.created_at);
					}
				});
			}

			return chkInDate;
		},
		getPrettyRevisionList: function() {
			var self = this;

			if ( !_.isUndefined(this.get('_revisions')) ) {
				var prettyRevisions = [];

				var revisions = this.get('_revisions');
			
				_.each(revisions, function(rev, index) {
					
					var msgString = '';
					
					for ( var field in rev.data ) {
						
						var before;
						var after;

						var data = rev.data[field];

						// Is this the last revision field?
						if ( (index + 1) == revisions.length ) {
							before = data;

							// Use the current val for after
							after = self.get(field);
						} else {
							before = data;
							after = revisions[index + 1].data[field];
						}

						if ( _.isObject(before) || _.isObject(after) ) {
							msgString += " - " + field.capitalize() + ' changed<br />';
						} else {
							msgString += " - " + field.capitalize() + ' changed from "' + before + '" to "' + after + '"<br />';
						}
					
					}

					prettyRevisions.push({
						createdAt: (new Date(rev.created_at)).toLocaleString(),
						msg: msgString
					});

				});

				return prettyRevisions.reverse();
			}

			return [];
		},
		parse: function(response) {
			if ( response.result ) {
				return response.result.data;
			}

			return response;
		}
	});

	// Define Sample collection
	SSLIMS.Samples = Backbone.Collection.extend({
		model: SSLIMS.Sample,
		url: SSLIMS.API_URL + '/samples',
		parse: function(response) {
			return response.result.data;  
		}
	});


	// Define Email model
	SSLIMS.Email = Backbone.Model.extend({
		name: 'Email',
		urlRoot: SSLIMS.API_URL + '/emails',
		parse: function(response) {
			if ( response.result ) {
				return response.result.data;
			}

			return response;
		}
	});

	// Define Email collection
	SSLIMS.Emails = Backbone.Collection.extend({
		model: SSLIMS.Email,
		url: SSLIMS.API_URL + '/emails',
		parse: function(response) {
			return response.result.data;  
		}
	});


	// Define AlertTemplate model
	SSLIMS.AlertTemplate = Backbone.Model.extend({
		name: 'AlertTemplate',
		urlRoot: SSLIMS.API_URL + '/alert_templates',
		parse: function(response) {
			if ( response.result ) {
				return response.result.data;
			}

			return response;
		}
	});

	// Define AlertTemplate collection
	SSLIMS.AlertTemplates = Backbone.Collection.extend({
		model: SSLIMS.AlertTemplate,
		url: SSLIMS.API_URL + '/alert_templates',
		parse: function(response) {
			return response.result.data;  
		}
	});


	// Define Run model
	SSLIMS.Run = Backbone.Model.extend({
		name: 'Run',
		urlRoot: SSLIMS.API_URL + '/runs',
		getSVGURL: function(index) {
			if ( _.isUndefined(this.get('edited_svg_file')) ) {
				return SSLIMS.API_URL + '/files/' + this.get('svg_file')[index];
			}
			return SSLIMS.API_URL + '/files/' + this.get('edited_svg_file')[index];
			
		},
		parse: function(response) {
			if ( response.result ) {
				return response.result.data;
			}

			return response;
		}
	});

	// Define Run collection
	SSLIMS.Runs = Backbone.Collection.extend({
		model: SSLIMS.Run,
		url: SSLIMS.API_URL + '/runs',
		parse: function(response) {
			return response.result.data;  
		}
	});


	// Define FileDownload model
	SSLIMS.FileDownload = Backbone.Model.extend({
		name: 'FileDownload',
		urlRoot: SSLIMS.API_URL + '/files',
		parse: function(response) {
			if ( response.result ) {
				return response.result.data;
			}

			return response;
		}
	});

	// Define FileDownload collection
	SSLIMS.FileDownloads = Backbone.Collection.extend({
		model: SSLIMS.FileDownload,
		url: SSLIMS.API_URL + '/files',
		parse: function(response) {
			return response.result.data;  
		}
	});



	// Define AccountRequest model
	SSLIMS.AccountRequest = Backbone.Model.extend({
		name: 'AccountRequest',
		urlRoot: SSLIMS.API_URL + '/account_requests',
		parse: function(response) {
			if ( response.result ) {
				return response.result.data;
			}

			return response;
		}
	});

	// Define AccountRequest collection
	SSLIMS.AccountRequests = Backbone.Collection.extend({
		model: SSLIMS.AccountRequest,
		url: SSLIMS.API_URL + '/account_requests',
		parse: function(response) {
			return response.result.data;  
		}
	});

	// Define alert model
	SSLIMS.Event = Backbone.Model.extend({
		name: 'Event',
		urlRoot: SSLIMS.API_URL + '/events',
		delivered: function() {
			this.save('delivered', true);
		},
		parse: function(response) {
			if ( response.result ) {
				return response.result.data;
			}

			return response;  
		}
	});

	// Define alerts collection
	SSLIMS.Events = Backbone.Collection.extend({
		model: SSLIMS.Event,
		url: SSLIMS.API_URL + '/events',
		parse: function(response) {
			return response.result.data; 
		}
	});

	// Define request model
	SSLIMS.Request = Backbone.Model.extend({
		name: 'Request',
		getPhotoURL: function() {
			return SSLIMS.API_URL + '/files/' + this.get('photo');
		},
		getDataDownload: function(downloadData, downloadFormat) {
			return SSLIMS.API_URL + '/files/' + this.get(downloadData)[downloadFormat];
		},
		getScanForm: function() {
			return SSLIMS.API_URL + '/files/' + this.get('pdf_file');
		},
		getProgressBar: function() {
			var self = this;

			// http://stackoverflow.com/a/18085357/289194
			// var getGreenToRed = function(percent){
			// 	r = percent < 50 ? 255 : Math.floor(255-(percent*2-100)*255/100);
			// 	g = percent > 50 ? 255 : Math.floor((percent*2)*255/100);
			// 	return 'rgb(' + r + ',' + g + ',0)';
			// }

			var getGreenToRed = function(percent) {
				var color;
				var textColor;

				if ( percent > 66 ) {
					color = '#00bd9c';
					textColor = '#FFF';
				} else if ( percent > 33 ) {
					color = '#f2c779';
					textColor = '#858589';
				} else if ( percent > 0 ) {
					color = '#f35e5e';
					textColor = '#858589';
				}

				return {color: color, textColor: textColor};
			};

			var sequencingComplete = (function() {
				for ( var n = 0; n < self.get('samples').length; n++ ) {
					if ( self.get('samples')[n].status != 'Sequencing complete' ) return false;
				}
				return true;
			})();

			var numComplete = 0;

			var percentage = (function() {
				for ( var n = 0; n < self.get('samples').length; n++ ) {
					if ( self.get('samples')[n].status == 'Sequencing complete' ) numComplete++;
				}

				return Math.ceil((numComplete / self.get('samples').length) * 100);
			})();

			percentage = (percentage == 0) ? 10 : percentage;

			return {
				status: sequencingComplete ? 'Sequencing Complete' : ('Processing Request (' + numComplete + ' of ' + self.get('samples').length + ' samples sequenced)'),
				percentage: percentage,
				color: getGreenToRed(percentage).color,
				textColor: getGreenToRed(percentage).textColor,
				sequencingComplete: sequencingComplete
			};

		},
		urlRoot: SSLIMS.API_URL + '/requests',
		parse: function(response) {
			if ( response.result ) {
				return response.result.data;
			}

			return response;  
		}
	});

	// Define requests collection
	SSLIMS.Requests = Backbone.Collection.extend({
		model: SSLIMS.Request,
		url: SSLIMS.API_URL + '/requests',
		parse: function(response) {
			return response.result.data;  
		}
	});

}(window.SSLIMS = window.SSLIMS || {}, jQuery));