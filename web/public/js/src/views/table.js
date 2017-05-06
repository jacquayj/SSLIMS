(function(SSLIMS, $, undefined) {

	SSLIMS.TableView = Backbone.View.extend({
		tagName: 'div',
		className: 'table-view',
		events: {
			'keyup .search': 'filterResult',
			'mousedown th': 'sortTable',
			'click th.chk label input': 'toggleAllCheck'
		},
		initialize: function(options) {

			// Set default option values
			this.options = _.defaults(options, {
				collection: function() {},
				title: 'No Title Specified',
				query: {},
				fields: [],
				eachRow: function() {},
				rowMouseDown: function() {},
				checkboxClick: function() {},
				options: _.defaults(options.options, {
					checkBoxes: true,
					perPage: 10,
					filter: true,
					emptyMessage: 'No items found'
				}),
				buttons: []
			});

			if ( _.isUndefined(SSLIMS.state[this.options.title]) ) SSLIMS.state[this.options.title] = {};
			
			this.state = SSLIMS.state[this.options.title];

			// Stores the current page
			if ( _.isUndefined(this.state.currentPage) ) this.state.currentPage = 1;
			
			// Stores the id field of models
			if ( _.isUndefined(this.state.checkedItems) ) this.state.checkedItems = [];
			
			// Stores the id field of models
			if ( _.isUndefined(this.state.removedItems) ) this.state.removedItems = [];

			// Stores the sort state of fields
			if ( _.isUndefined(this.state.fields) ) this.state.fields = this.options.fields;

			if ( _.isUndefined(this.state.searchTerm) ) this.state.searchTerm = '';

			// Fix removedItems table view query bug
			if ( this.state.removedItems.length > 0 ) this.setRemoveItemsQuery(this.state.removedItems);

			// Init the paginator object (abstraction for getting models by page, and loading buffer)
			this.paginator = new SSLIMS.Paginator({
				parentView: this,
				collection: this.options.collection,
				query: this.options.query,
				perPage: this.options.options.perPage
			});

		},
		setRemoveItemsQuery: function(removedItems) {
			if ( _.isUndefined(this.options.query['$and']) ) {
				this.options.query['$and'] = removedItems;
			} else {
				//this.options.query['$and'] = this.options.query['$and'].concat(removedItems);
			}

			if ( this.options.query['$and'].length == 0 ) delete this.options.query['$and'];
		},
		render: function(callback) {
			var self = this;

			// Set default callback parameter
			callback = _.isUndefined(callback) ? (function() {}) : callback;

			SSLIMS.loadTemplate('table/view', function(tpl) {

				// Get models to be rendered based on page
				self.paginator.getPage({
					page: self.state.currentPage,
					resetBuffer: true,
					finished: function(models) {

						// Make models accessable in template
						self.models = models;

						// Render template, add to DOM
						if ( self.$el.html() == '' ) {
							self.$el.html(tpl(self));

							// Bind button event handlers
							$('.table-view-btn', self.$el).each(function(index, btn) {
								$(btn).click(function() {
									if ( _.isUndefined(self.options.buttons[index].excludeModels) ) {
										self.getCheckedModels(function(models) {
											self.options.buttons[index].click.call(self, models);
										});
									} else {
										self.options.buttons[index].click.call(self);
									}
								});
							});
						} 

						// Filter and sort result before rendering since the UI state is probably saved
						self.preFilterResult(function() {
							self.preToggleSort(function() {
								// Add items to table
								self.renderData();

								// Add pagination to view
								self.renderPagination();

								// Highlight the pagination link that represents current page
								self.highlightPagination();

								// Run callback
								callback(self.$el);
							});
						});
					}
				});
				
			}, true);

			// Handle when the element is removed from DOM
			this.$el.on('destroyed', this.deleteView);

			return this;
		},
		getCheckedModels: function(callback) {
			var self = this;

			// Init the query object
			var arr = [];

			// Build the query
			_.each(this.state.checkedItems, function(id) {
				arr.push({
					id: id
				});
			});

			var query = {
				$and: [
					this.options.query,
					{$or: arr}
				]
			};

			// Ajax request to populate models and pass collection to handler
			var collection = new this.options.collection();
			collection.fetch({
				data: {
					limit: this.state.checkedItems.length,
					query: Base64.encode(JSON.stringify(query))
				},
				reset: true,
				success: function(coll) {
					// Delete any checked item out of state object if it isn't returned
					// var n = self.state.checkedItems.length;
					// while ( n-- ) {
					// 	var checkedItem = self.state.checkedItems[n];
					// 	var inResponse = false;

					// 	coll.each(function(m) {
					// 		if ( m.get('id') == checkedItem ) {
					// 			inResponse = true;
					// 		}
					// 	});

					// 	if ( !inResponse ) {
					// 		self.state.checkedItems.splice(0, n);
					// 		self.state.save();
					// 	}
					// }

					callback(coll);
				}
			});
		},
		resetSortState: function() {
			// This removes the sort state information from this.options.fields
			_.each(this.state.fields, function(field) {
				if ( !_.isUndefined(field.sort) ) delete field.sort;
			}, this);
		},
		preToggleSort: function(callback) {

			var sorted_field = _.find(this.state.fields, function(field) {
				return !_.isUndefined(field.sort);
			});

			if ( !_.isUndefined(sorted_field) ) {
				var index = _.indexOf(this.state.fields, sorted_field);
				var el_index = index + 1;

				if ( !this.options.options.checkBoxes ) el_index--;

				this.toggleSort(index, $('th:eq(' + el_index + ')', this.$el), callback);
			} else {
				callback();
			}
		},
		toggleSort: function(fieldIndex, field, callback) {
			var self = this;

			// Get the field's name and sort state from options
			var fieldOpt = this.state.fields[fieldIndex];
			var fieldName = this.state.fields[fieldIndex][_.keys(fieldOpt)[0]];

			// Define what the field will look like based on sort order
			var sortElements = { 
				asc: $('<span class="glyphicon glyphicon-chevron-up"></span>'),
				desc: $('<span class="glyphicon glyphicon-chevron-down"></span>')
			};

			if ( _.isUndefined(callback) ) {
				// Get direction, defaults to asc
				if ( _.isUndefined(fieldOpt.sort) ) {
					var direction = 'asc';
				} else if ( fieldOpt.sort == 'asc' ) {
					var direction = 'desc';
				} else {
					var direction = 'asc';
				}
			} else {
				var direction = fieldOpt.sort;
			}
			

			// Run the sort
			this.paginator.sort({
				currentPage: this.state.currentPage,
				field: fieldName,
				direction: direction,
				finished: function(models) {

					// Update models for use in renderData()
					self.models = models;

					// Reset sort state data
					self.resetSortState(field);

					// Set sort state
					fieldOpt.sort = direction;

					// Remove all of the sort icons
					$('th span.glyphicon', this.$el).remove();

					// Set sort icon for field
					field.append(sortElements[direction]);

					// Render the new sorted data, only if this was called by UI handler
					if ( _.isUndefined(callback) ) {
						self.renderData();
					} else {
						callback();
					}
				}
			});

		},
		sortTable: function(e) {

			// Prevent text highlighting
			e.preventDefault();

			// Get the th tag that was clicked
			var thField = $(e.currentTarget);

			// If they actually clicked a field
			if ( thField.html() !== '' && !thField.hasClass('chk') ) {

				// Get exising sort state
				var sortField = _.find(this.state.fields, function(field) {
					return thField.html().indexOf(_.keys(field)[0]) != -1;
				});

				if ( !_.isUndefined(sortField) && !_.isNull(sortField[_.keys(sortField)[0]]) ) {
					var optionsIndex = _.indexOf(this.state.fields, sortField);

					this.toggleSort(optionsIndex, thField);
				}

			}
		},
		getAllModels: function(callback) {
			var self = this;

			callback = callback ? callback : function() {};

			var allModels = [];

			var w = new SSLIMS.EventWaiter(this.paginator.numPages, function() {
				callback(allModels);

				self.render();
			});

			var getAPage = function(n) {
				// Get models to be rendered based on page
				self.paginator.getPage({
					page: n,
					finished: function(mdls) {
						
						allModels = allModels.concat(mdls);
						var nextPage = n + 1;

						if ( self.paginator.numPages >= nextPage ) {
							getAPage.call(self, nextPage);
						} 

						w.finished();
					}
				});	
			};

			getAPage(1);		

		},
		renderPagination: function() {
			var self = this;
			var pagination = $('.ui-pagination', this.$el).html('');

			if ( this.models.length > 0 ) {
				// Create element with event handler attached
				var pageLeft = $('<div class="glyphicon glyphicon-chevron-left"></div>').mousedown(function(e) {
					e.preventDefault();

					var requestedPage = self.state.currentPage - 1;

					if ( requestedPage == 0 ) {
						self.changePage(self.paginator.numPages);
					} else {
						self.changePage(requestedPage);
					}
				});

				// Create element with event handler attached
				var pageRight = $('<div class="glyphicon glyphicon-chevron-right"></div>').mousedown(function(e) {
					e.preventDefault();

					var requestedPage = self.state.currentPage + 1;

					if ( requestedPage > self.paginator.numPages ) {
						self.changePage(1);
					} else {
						self.changePage(requestedPage);
					}

				});


				pagination.append(pageLeft);

				for ( var n = 1; n <= this.paginator.numPages; n++ ) {
					pagination.append($('<span />').html(n));
				}

				pagination.append(pageRight);

				$('span', pagination).mousedown(function(e) {
					e.preventDefault();
					self.changePage.call(self, e);
				});
			}
			
		},
		isItemChecked: function(model) {
			return _.contains(this.state.checkedItems, model.id);
		},
		isAllChecked: function() {
			return _.isUndefined(_.find(this.models, function(model) {
				return !this.isItemChecked(model);
			}, this));
		},
		checkItem: function(model) {
			if ( !this.isItemChecked(model) ) {
				this.state.checkedItems.push(model.id);
			}
		},
		uncheckItem: function(model) {
			if ( this.isItemChecked(model) ) {
				var index = _.indexOf(this.state.checkedItems, model.id);
				delete this.state.checkedItems[index];
				this.state.checkedItems.splice(index, 1);
			}
		},
		toggleAllCheck: function() {

			if ( this.isAllChecked() ) {
				_.each(this.models, function(model) {
					this.uncheckItem(model);
				}, this);
			} else {
				_.each(this.models, function(model) {
					this.checkItem(model);
				}, this);
			}

			this.options.checkboxClick();

			this.renderData();

		},
		toggleCheck: function(model) {
			if ( this.isItemChecked(model) ) {
				this.uncheckItem(model);
			} else {
				this.checkItem(model);
			}
		},
		// unremoveItem: function(modelId, render) {
		// 	if ( _.isUndefined(render) ) render = true;

		// 	if ( !_.isUndefined(this.options.query['$and']) ) {
		// 		var removeIndex = null;

		// 		// State contains a list of items that should be excluded from table
		// 		_.each(this.state.removedItems, function(item, index) {
		// 			if ( item.id['$ne'] == modelId ) removeIndex = index;
		// 		});
		// 		this.state.removedItems.splice(removeIndex, 1);


		// 		// removeIndex = null;

		// 		// _.each(this.options.query['$and'], function(item, index) {
		// 		// 	if ( item.id['$ne'] == modelId ) removeIndex = index;
		// 		// });
		// 		// this.options.query['$and'].splice(removeIndex, 1);



		// 		if ( this.options.query['$and'].length == 0 ) delete this.options.query['$and'];

		// 		if ( render ) this.render();
		// 	} 
		// },

		unremoveItem: function(modelId, render) {
			if ( _.isUndefined(render) ) render = true;

			if ( this.isItemRemoved(modelId) ) {
				var removeIndex = null;

				// State contains a list of items that should be excluded from table
				_.each(this.state.removedItems, function(item, index) {
					if ( item.id['$ne'] == modelId ) removeIndex = index;
				});
				this.state.removedItems.splice(removeIndex, 1);

				this.setRemoveItemsQuery(this.state.removedItems);

				console.log(this.state.removedItems);

				if ( render ) this.render();
			}
		},

		isItemRemoved: function(modelID) {
			var self = this;
			var removed = false;

			_.each(this.state.removedItems, function(item, index) {
				if ( item.id['$ne'] == modelID ) removed = true;
			});

			return removed;
		},
		hasRemovedItems: function() {
			return this.state.removedItems.length > 0;
		},
		removeItems: function(modelIds) {
			var self = this;

			_.each(modelIds, function(mid) {
				if ( !self.isItemRemoved(mid) ) {
					self.state.removedItems.push({id: {$ne: mid}});
				}
			});

			this.setRemoveItemsQuery(this.state.removedItems);

			this.render();
		},
		removeItem: function(modelId) {
			if ( !this.isItemRemoved(modelId) ) {
				this.state.removedItems.push({id: {$ne: modelId}});

				this.setRemoveItemsQuery(this.state.removedItems);

				this.render();
			}
		},
		resetRemoved: function() {
			var self = this;


			_.each(this.state.removedItems, function(item) {
				this.unremoveItem(item.id['$ne'], false);
			}, this);

			this.state.removedItems = [];

			delete this.options.query['$and'];

			this.render();
		},
		renderData: function() {
			var self = this;

			// Get table body element and reset it
			var tBody = $('tbody', this.$el).html('');

			if ( this.models.length > 0 ) {

				if ( self.isAllChecked() ) {
					$('th.chk input', self.$el).prop('checked', true);
				} else {
					$('th.chk input', self.$el).prop('checked', false);
				}

				// loop through the models
				_.each(this.models, function(model) { 

					var columns = this.options.eachRow(model);

					var bindEvent = function(ev) {
						self.options.rowMouseDown(ev, model);
					};

					var row = $('<tr />').mousedown(bindEvent).on({'touchstart': bindEvent});
					
					if ( this.options.options.checkBoxes ) {

						var chk = $('<td class="chk"><label><input type="checkbox"><span></span></label></td>');

						var chkBox = $('input', chk).click(function() {
							self.toggleCheck(model);

							self.options.checkboxClick();

							if ( self.isAllChecked() ) {
								$('th.chk input', self.$el).prop('checked', true);
							} else {
								$('th.chk input', self.$el).prop('checked', false);
							}
							
						});

						if ( _.contains(this.state.checkedItems, model.get('id')) ) chkBox.prop('checked', true);

						row.append(chk);
					}

					_.each(columns, function(col, index) {
						var el = $('<td />');

						if ( !_.isUndefined(this.state.fields[index].tdClass) ) {
							el.addClass(this.state.fields[index].tdClass);
						}

						row.append(el.html(col));
					}, this);
					
					tBody.append(row);
				}, this);
			} else {
				var numCols = this.options.fields.length;
				if ( this.options.options.checkBoxes ) numCols++;

				tBody.append($('<tr><td class="ui-table-no-result" colspan="' + numCols + '">' + this.options.options.emptyMessage + '</td></tr>'));
			}

		},
		preFilterResult: function(callback) {
			var self = this;

			if ( this.state.searchTerm != '' ) {
				this.paginator.filter({
					query: this.buildQuery(this.state.searchTerm),
					initPage: this.state.currentPage,
					finished: function(models) {
						self.models = models;

						callback();
					}
				});
			} else {
				callback();
			}
		},
		filterResult: function(e) {
			var self = this;

			this.state.searchTerm = $(e.currentTarget).val();

			if ( this.state.searchTerm === '' ) {
				this.paginator.resetFilter(function(models) {
					self.models = models;
					self.state.currentPage = 1;

					self.renderData();
					self.renderPagination();
					self.highlightPagination();
				});
			} else {
				this.paginator.filter({
					query: this.buildQuery(this.state.searchTerm),
					finished: function(models) {
						self.models = models;
						self.state.currentPage = 1;

						self.renderData();
						self.renderPagination();
						self.highlightPagination();
					}
				});
			}
			
		},
		buildQuery: function(searchTerm) {
			// This will build the query based on the fields returned by the API, and will include nonvisible fields in the query
			// It could also use this.options.fields to only query visible fields. The only problem with that is combined fields e.g. first_name last_name

			// Init root query objecy
			var query = {$or: []};

			// Build query
			_.each(this.paginator.modelFields, function(field) {
				var fieldRegex = {};

				if ( _.isString(field) ) {
					fieldRegex[field] = {$regex: SSLIMS.escapeRegExp(searchTerm), $options: 'i'};

					var extactNum = parseInt(searchTerm);
					if ( !_.isNaN(extactNum) && !_.isNull(extactNum) ) {
						var exactMatch = {};
						exactMatch[field] = extactNum;
						query.$or.push(exactMatch);
					}
					
					query.$or.push(fieldRegex);
				} else {
					var assoc = field.name;
					var assocFields = field.fields;

					_.each(assocFields, function(subField) {
						var subFieldRegex = {};

						subFieldRegex[assoc + '.' + subField] = {$regex: SSLIMS.escapeRegExp(searchTerm), $options: 'i'};

						query.$or.push(subFieldRegex);
					});
				}
				
			});

			return query;
		},
		highlightPagination: function() {
			$('.ui-pagination span', this.$el).removeClass('selected');
			$('.ui-pagination span:eq(' + (this.state.currentPage - 1) + ')', this.$el).addClass('selected');
		},
		changePage: function(e) {
			var self = this;

			// So the function can be called in code or from event
			if ( _.isNumber(e) ) {
				this.state.currentPage = e;
			} else {
				this.state.currentPage = parseInt($(e.currentTarget).html());
			}

			// Get models to be rendered based on page
			this.paginator.getPage({
				page: this.state.currentPage,
				finished: function(models) {

					// Make models accessable in other methods
					self.models = models;

					// Add items to table
					self.renderData();

					// Highlight the pagination link that represents current page
					self.highlightPagination();

				}
			});

		},
		deleteView: function() {
			SSLIMS.unloadTemplate('table/view');
		}
	});

}(window.SSLIMS = window.SSLIMS || {}, jQuery));