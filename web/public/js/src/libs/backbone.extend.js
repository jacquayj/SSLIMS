var backboneSync = Backbone.sync;

Backbone.sync = function(method, model, options) {

	// Get request type using map
	var type = {
		'create': 'POST',
		'update': 'PUT',
		'patch':  'PATCH',
		'delete': 'DELETE',
		'read':   'GET'
	}[method];


	var theURL = _.result(model, 'url');

	if ( !_.isUndefined(options.url) ) {
		if ( options.url.length > theURL.length ) {
			theURL = options.url;
		}
	}

	// Get the request path
	var path = theURL.replace(SSLIMS.API_URL_BASE, '');

	// Get request body data if the request is the appropriate type
	if ( !options.data && model && (method == 'create' || method == 'update') ) {
		if ( method == 'create' ) {
			var data = JSON.stringify(model.toJSON());
		} else {
			var changed = model.changedAttributes();

			if ( !_.isUndefined(options.includeKeys) ) {
	          _.each(options.includeKeys, function(key) {
	            changed[key] = model.get(key);
	          });
	       }

			
			var data = JSON.stringify(changed || {})
		}
	}

	if ( !SSLIMS.isGuest ) {
		// Set auth header
		options.headers = {
			'X-SSLIMS-Auth': SSLIMS.getAuthHeader({
				type: type,
				path: path,
				timestamp: Math.round(new Date().getTime() / 1000),
				data: data,
				get_data: options.data
			})
		};
	}
	
	return backboneSync(method, model, options);
}

