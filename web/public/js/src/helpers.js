jQuery.event.special.destroyed = {
	remove: function(o) {
		if ( o.handler ) {
			o.handler();
		}
	}
};

Storage.prototype.setObject = function(key, value) {
	this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function(key) {
	var value = this.getItem(key);
	return value && JSON.parse(value);
};

Array.prototype.clone = function() {
	return this.slice(0);
};

String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype._ = function() {
	return SSLIMS.escapeHtml(this);
};

Date.prototype.timeSince = function() {
	var seconds = Math.floor((new Date() - this) / 1000);

	var interval = Math.floor(seconds / 31536000);

	if (interval > 1) {
		return interval + " years";
	}
	interval = Math.floor(seconds / 2592000);
	if (interval > 1) {
		return interval + " months";
	}
	interval = Math.floor(seconds / 86400);
	if (interval > 1) {
		return interval + " days";
	}
	interval = Math.floor(seconds / 3600);
	if (interval > 1) {
		return interval + " hours";
	}
	interval = Math.floor(seconds / 60);
	if (interval > 1) {
		return interval + " minutes";
	}
	return Math.floor(seconds) + " seconds";
};

(function($) {
    $.fn.toggleDisabled = function(){
        return this.each(function(){
            this.disabled = !this.disabled;
        });
    };
})(jQuery);

(function(SSLIMS, $, undefined) {

	SSLIMS.statusMap = {
		'Waiting to receive': 0,
		'Received, ready to load': 1,
		'Loaded, ready for sequencing': 2,
		'Sequencing complete': 3
	};

	// Loads specific object from local storage based on document hash
	SSLIMS.routeState = function() {
		var self = this;

		//var route = window.location.hash.split('/')[0];
		var route = window.location.hash;

		// Get data from local storage
		var storage = SSLIMS.ls.getObject('route_states');

		var init = function() {
			// Init storage object if it doesn't exist
			if ( _.isNull(storage) ) storage = {};

			// Init the route object if needed
			if ( _.isUndefined(storage[route]) ) storage[route] = {};

			// Unload the properties to the current object
			for ( var prop in storage[route] ) self[prop] = storage[route][prop];
		};

		this.changeRoute = function(newRoute) {
			route = newRoute;
			init();
		};

		this.save = function() {
			storage[route] = this;

			// Don't pollute local storage with empty state data
			if ( JSON.stringify(storage[route]) != '{}' ) SSLIMS.ls.setObject('route_states', storage);
		};

		this.reset = function() {
			for ( var prop in storage[route] ) delete self[prop];

			storage[route] = {};

			SSLIMS.ls.setObject('route_states', storage);
		};

		init();

	};

	SSLIMS.escapeHtml = function(unsafe) {
		return unsafe
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	};

	SSLIMS.invalidateRouteCache = function(route) {
		// Get data from local storage
		var storage = SSLIMS.ls.getObject('route_states');

		delete storage[route];

		SSLIMS.ls.setObject('route_states', storage);

		SSLIMS.state = new SSLIMS.routeState();
	};

	// General purpose object store for local storage
	SSLIMS.LocalStorageObject = function(ls_name) {

		// Get data from local storage
		var storage = SSLIMS.ls.getObject(ls_name);

		// Init storage object if it doesn't exist
		if ( _.isNull(storage) ) storage = {};

		// Unload the properties to the current object
		for ( var prop in storage ) this[prop] = storage[prop];

		this.save = function() {
			storage = this;

			// Don't pollute local storage with empty state data
			if ( JSON.stringify(storage) != '{}' ) SSLIMS.ls.setObject(ls_name, storage);
		};

	};


	SSLIMS.iOS = function() {
		return /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
	};

	SSLIMS.isFullScreen = function() {
		return ("standalone" in window.navigator) && window.navigator.standalone;
	};

	SSLIMS.wellIndexToName = function(index) {
		index = parseInt(index) + 1;
		
		var rowIndex = Math.ceil(index / 12) - 1;
		var rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
		var itemIndex = 12 - (((rowIndex + 1) * 12) - index);

		return rows[rowIndex] + itemIndex;
	};

	SSLIMS.wellIndexToVert = function(index) {
		index = parseInt(index) + 1;
		
		var rowIndex = Math.ceil(index / 12) - 1;
		var colIndex = 12 - (((rowIndex + 1) * 12) - index);

		var newIndex = ((colIndex - 1) * 8) + rowIndex;

		return newIndex + 1;
	};

	SSLIMS.wellIndexConvert = function(index) {
		index = parseInt(index);

		var col = Math.ceil(index / 8);
		var row = index - ((col - 1) * 8);

		return (col + ((row - 1) * 12));
	};

	SSLIMS.TabGroup = function(el, i) { 
		el.each(function(index, element) {
			$(".ui-tab-content:eq(" + i + ")", element).show();
			$(".ui-tabs li:eq(" + i + ")", element).addClass('selected');

			// $(".ui-tabs a", element).click(function() {

			// 	var li = $(this).parent();
			// 	var index = li.index();

			// 	$(".ui-tab-content", element).hide();
			// 	$(".ui-tabs li", element).removeClass("selected");

			// 	li.addClass("selected");
			// 	$(".ui-tab-content:eq(" + index + ")", element).show();
			// });
		});
	};

	SSLIMS.downloadFile = function(filename, data) {
		var pom = document.createElement('a');
	    pom.setAttribute('href', data);
		pom.setAttribute('download', filename);
		pom.click();
	};

	SSLIMS.getAuthHeader = function(options) {

		// Get username and password hash from local storage
		var email = this.ls.getItem('email');
		var client_api_key = this.ls.getItem('client_api_key');

		// If no HTTP body data is included, make it an empty string for hashing
		if ( _.isUndefined(options.data) ) {
			options.data = '';
		}

		// If this is a GET request and data was passed, add the query string to end of URL for hashing
		if ( options.type == "GET" && !_.isUndefined(options.get_data) ) {
			options.path += "?" + $.param(options.get_data);
		}

		// Generate signurature
		var sig = CryptoJS.SHA256(options.type + "." + options.path + "." + CryptoJS.SHA256(options.data) + "." + options.timestamp + "." + client_api_key);

		// Return complete header value
		return email + ":" + options.timestamp + ":" + sig;
	};

	// Set the last page the app was on
	SSLIMS.pageChange = function() {
		var route = window.location.hash;

		if ( route != 'homescreen' ) {
			SSLIMS.ls.setItem('previous_route', SSLIMS.ls.getItem('last_route'));
			SSLIMS.ls.setItem('last_route', route);
		}

		
	};

	SSLIMS.DeleteCookies = function() {

		// This function will attempt to remove a cookie from all paths.
		var pathBits = location.pathname.split('/');
		var pathCurrent = ' path=';

		// do a simple pathless delete first.
		document.cookie = name + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT;';

		for (var i = 0; i < pathBits.length; i++) {
		    pathCurrent += ((pathCurrent.substr(-1) != '/') ? '/' : '') + pathBits[i];
		    document.cookie = name + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT;' + pathCurrent + ';';
		}

	};

	// Class used to call handler when multiple events finish
	SSLIMS.EventWaiter = function(count, callback, useContext) {
		var self = this;
		var counter = 0;

		if ( count == 0 ) callback();

		var options = {};

		this.error = false;
		this.errorMsg = "";

		this.finished = function(opts) {
			counter++;

			_.extend(options, opts);

			if ( counter == count ) {
			
				if ( _.isUndefined(useContext) ) {
					callback(options);
				} else {
					callback.call(self, options);
				}
				
			}
		};
	};

	SSLIMS.Paginator = function(options) {

		// Private
		var options, collection, resourceOffset, resourceCount, bufferEmpty, filterQuery, sortQuery;
		var self = this;

		var loadBuffer = function(query, offset, callback) {

			// Set default callback parameter
			callback = _.isUndefined(callback) ? (function() {}) : callback;

			var data = {
				limit: options.bufferSize,
				offset: offset,
				query: Base64.encode(JSON.stringify(query.query))
			};

			if ( !_.isUndefined(query.filter) ) data['filter'] = Base64.encode(JSON.stringify(query.filter));
			if ( !_.isUndefined(query.sort) ) {
				data['sort'] = query.sort.field + ',' + query.sort.direction;

				if ( _.isUndefined(query.filter) ) data['filter'] = Base64.encode(JSON.stringify({}));
			}


			collection.fetch({
				data: data,
				reset: true,
				success: function(coll, response) {
					
					resourceCount = response.result.query_result_count;
					resourceOffset = offset;

					// Set the number of pages
					self.numPages = Math.ceil(resourceCount / options.perPage);

					// Set the field list if needed
					if ( _.isUndefined(self.modelFields) ) self.modelFields = response.result.fields;

					bufferEmpty = false;

					// Run callback
					callback(coll.models);
				}
			});

		};


		// Public methods
		this.getPage = function(opts) {
			// Set defaults
			opts = _.defaults(opts, {
				page: 1,
				resetBuffer: false,
				finished: function() {}
			});

			// Start and end index of buffer relative to entire data set
			var startBufferIndex = resourceOffset;
			var endBufferIndex = bufferEmpty ? 0 : resourceOffset + options.bufferSize;

			// Start and end index of page relative to buffer start index
			var startPageIndex = (opts.page - 1) * options.perPage;
			var endPageIndex = startPageIndex + options.perPage;
			
			// Create query object to pass to load buffer
			var q = {query: options.query};
			
			if ( !_.isUndefined(filterQuery) ) q.filter = filterQuery;
			if ( !_.isUndefined(sortQuery) ) q.sort = sortQuery;


			// Is in range of buffer on either side
			if ( (startBufferIndex <= startPageIndex) && (endBufferIndex >= endPageIndex) ) {
				var sIndex = endBufferIndex - startPageIndex;

				var startSlice = startPageIndex - startBufferIndex;
				var endSlide = startSlice + options.perPage;

				opts.finished(collection.models.slice(startSlice, endSlide));
			} else { // Not in range

				// Yes, determine the offset with math!
				var pages_per_buffer = options.bufferSize / options.perPage;
				var buffer_index = Math.ceil(opts.page / pages_per_buffer) - 1;

				var os = options.bufferSize * buffer_index;

				// Load buffer
				loadBuffer(q, os, function(models) {
					// var ebi = os + options.bufferSize;
					// var sIndex = ebi - startPageIndex;

					var startSlice = startPageIndex - os;
					var endSlide = startSlice + options.perPage;

					opts.finished(models.slice(startSlice, endSlide));
				});
			}

		};

		this.sort = function(opts) {
			opts = _.defaults(opts, {
				currentPage: 1,
				field: '_id',
				direction: 'asc',
				finished: function() {}
			});

			// Set filter query so getPage will use it when calling loadBuffer
			sortQuery = {
				field: opts.field,
				direction: opts.direction
			};

			// Make getPage reload the buffer since the current buffer contains out of date data due to sort
			bufferEmpty = true;

			this.getPage({
				page: opts.currentPage,
				finished: opts.finished
			});
		};

		// Add filter
		this.filter = function(opts) {
			opts = _.defaults(opts, {
				query: {},
				initPage: 1,
				finished: function() {}
			});

			// Set filter query so getPage will use it when calling loadBuffer
			filterQuery = opts.query;

			// Make getPage reload the buffer since the current buffer contains out of date data due to filter query
			bufferEmpty = true;

			this.getPage({
				page: opts.initPage,
				finished: opts.finished
			});
		};

		this.resetFilter = function(callback) {
			filterQuery = undefined;

			// Make getPage reload the buffer since the current buffer contains out of date data due to filter query
			bufferEmpty = true;

			this.getPage({
				page: 1,
				finished: callback
			});
		};

		// Constructor code
		options = _.defaults(options, {
			collection: function() {},
			bufferSize: 20,
			query: {},
			perPage: 10
		});

		bufferEmpty = true;
		resourceOffset = 0;

		collection = new options.collection();

		// Handle collection update events
		if ( !_.isUndefined(options.parentView) ) {
			SSLIMS.collectionEvents.on(collection.model.prototype.name, function() {
				options.parentView.render();
			});
		}
	};

	SSLIMS.escapeRegExp = function(str) {
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	};

	// See if regex matches string contained in object
	SSLIMS.objMatch = function(obj, regex) {

		if ( _.isString(obj) ) {
			return !_.isNull(obj.match(regex));
		} else if ( _.isArray(obj) ) {
			return !_.isUndefined(_.find(obj, function(el) {
				return SSLIMS.objMatch(el, regex); 
			}));
		} else if ( _.isObject(obj) ) {
			var has_match = false;
			_.each(obj, function(value, key) {
				if ( SSLIMS.objMatch(value, regex) ) has_match = true;
			});
			return has_match;
		} else if ( _.isNumber(obj) ) {
			return SSLIMS.objMatch(obj.toString(), regex);
		}

		return false;
	};

	SSLIMS.parseQuery = function() {

		var q = window.location.hash.split('?')[1];

		var obj = {};
		var vs = q.split('&');

		_.each(vs, function(v) {
			var split = v.split('=');

			obj[split[0]] = decodeURIComponent(split[1]);
		});

		return obj;
	};


	// This probably isn't broken, check your view's unload method
	SSLIMS.loadTemplate = function(name, callback, loadCSS) {

		// Init template cache
		this.templates = _.isUndefined(this.templates) ? {} : this.templates;

		// Init template in cache if needed
		this.templates[name] = _.isUndefined(this.templates[name]) ? {cssInstanceCount: 0} : this.templates[name];

		// Has the template been loaded already?
		if ( !_.isUndefined(this.templates[name].html) ) {

			// Add CSS tag if it doesn't exist on the page, and loadCSS option is true
			if ( $("style[id*='t-" + name + "']").length == 0 && loadCSS ) {
				$('head').append($('<style type="text/css" id="t-' + name + '" />').html(this.templates[name].css));
			}

			// Increment the document instance count (only if the template uses CSS)
			if ( loadCSS ) this.templates[name].cssInstanceCount++;

			// Run callback with cached data
			callback(_.template(this.templates[name].html));

		} else {

			// Init callback queue if needed
			if ( _.isUndefined(this.templates[name].callbacks) ) this.templates[name].callbacks = [];

			// Queue the callback
			this.templates[name].callbacks.push(callback);

			// Is this the first load request for the template?
			if ( this.templates[name].callbacks.length == 1 ) {
				var html, css;

				// Define function that runs when both HTML & CSS AJAX requests complete
				var wait = new this.EventWaiter(2, function() {
					
					// Add HTML and CSS string to cache
					SSLIMS.templates[name].html = html;
					SSLIMS.templates[name].css = css;

					// Add CSS tag to document if loadCSS option is true
					if ( loadCSS ) $('head').append($('<style type="text/css" id="t-' + name + '" />').html(css));

					var renderedTemplate = _.template(html);

					// Loop through & run callback queue
					_.each(SSLIMS.templates[name].callbacks, function(aCallback) {
						// Add CSS tag to document if loadCSS option is true
						if ( loadCSS ) SSLIMS.templates[name].cssInstanceCount++;

						aCallback(renderedTemplate);
					});
				});

				// Send HTML template ajax request
				$.get('templates/' + name + '.html', function(data) {
					html = data;
				}).always(function() {
					wait.finished();
				});

				// Send CSS AJAX request if loadCSS option is true
				if ( loadCSS ) {
					$.get('templates/' + name + '.css', function(data) {
						css = data;
					}).always(function() {
						wait.finished();
					});
				} else {
					wait.finished();
				}
			}
		}

	};

	// This probably isn't broken, check your view's unload method
	SSLIMS.unloadTemplate = function(name, delete_cache) {
		delete_cache = !_.isUndefined(delete_cache) ? delete_cache : false;

		// If the template exists
		if ( !_.isUndefined(this.templates[name]) ) {

			if ( this.templates[name].cssInstanceCount == 1 ) {
				this.templates[name].cssInstanceCount--;
				$("style[id*='t-" + name + "']").remove();
			} else if ( $("style[id*='t-" + name + "']").length ) { 
				this.templates[name].cssInstanceCount--;
			}

			if ( delete_cache ) {
				delete this.templates[name];
			}

		}
	};

	SSLIMS.stateList = {
		"AL": "Alabama",
		"AK": "Alaska",
		"AS": "American Samoa",
		"AZ": "Arizona",
		"AR": "Arkansas",
		"CA": "California",
		"CO": "Colorado",
		"CT": "Connecticut",
		"DE": "Delaware",
		"DC": "District Of Columbia",
		"FM": "Federated States Of Micronesia",
		"FL": "Florida",
		"GA": "Georgia",
		"GU": "Guam",
		"HI": "Hawaii",
		"ID": "Idaho",
		"IL": "Illinois",
		"IN": "Indiana",
		"IA": "Iowa",
		"KS": "Kansas",
		"KY": "Kentucky",
		"LA": "Louisiana",
		"ME": "Maine",
		"MH": "Marshall Islands",
		"MD": "Maryland",
		"MA": "Massachusetts",
		"MI": "Michigan",
		"MN": "Minnesota",
		"MS": "Mississippi",
		"MO": "Missouri",
		"MT": "Montana",
		"NE": "Nebraska",
		"NV": "Nevada",
		"NH": "New Hampshire",
		"NJ": "New Jersey",
		"NM": "New Mexico",
		"NY": "New York",
		"NC": "North Carolina",
		"ND": "North Dakota",
		"MP": "Northern Mariana Islands",
		"OH": "Ohio",
		"OK": "Oklahoma",
		"OR": "Oregon",
		"PW": "Palau",
		"PA": "Pennsylvania",
		"PR": "Puerto Rico",
		"RI": "Rhode Island",
		"SC": "South Carolina",
		"SD": "South Dakota",
		"TN": "Tennessee",
		"TX": "Texas",
		"UT": "Utah",
		"VT": "Vermont",
		"VI": "Virgin Islands",
		"VA": "Virginia",
		"WA": "Washington",
		"WV": "West Virginia",
		"WI": "Wisconsin",
		"WY": "Wyoming"
	};

}(window.SSLIMS = window.SSLIMS || {}, jQuery));