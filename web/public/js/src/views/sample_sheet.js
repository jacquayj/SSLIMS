(function(SSLIMS, $, undefined) {

	SSLIMS.EditSampleConfigPopupView = Backbone.View.extend({
		tagName: 'div',
		className: 'ui-popup-bg',
		events: {
			'click .ui-popup-close': 'hide',
			'click .save-sample-config-btn': 'saveConfig',
			'change #config-id': 'configChange'
		},
		initialize: function(options) {
			var self = this;
			this.well = options.well;
			this.wellInfo = options.wellInfo;
			

			(new SSLIMS.Instruments()).fetch({success: function(configs) {
				self.configs = configs;
				self.globalConfig = self.configs.get(self.well.sheet.parent.getConfigID());

				self.updateSelectedConfig();
				self.render();
			}});
			
		},
		modifyStateConfig: function() {
			var configOption = $("#config-id", this.$el).val();

			if ( configOption != "0" && this.globalConfig.get('id') != configOption ) {
				this.well.state.modelData.config = _.clone(this.configs.get(configOption).attributes);
			} else {
				delete this.well.state.modelData.config;
			}
		},
		configChange: function() {
			this.modifyStateConfig();

			this.updateSelectedConfig();
			this.render(true);
		},
		updateSelectedConfig: function() {
			if ( _.isUndefined(this.well.state.modelData.config) ) {
				this.tableConfig = this.globalConfig;
			} else {
				this.tableConfig = this.configs.get(this.well.state.modelData.config.id);
			}
		},
		saveConfig: function() {
			this.modifyStateConfig();
		
			this.wellInfo.render();
			this.hide();
		},
		render: function(rerender) {
			var self = this;

			rerender = _.isUndefined(rerender) ? false : rerender;

			SSLIMS.loadTemplate('sample_sheet/edit-sample-popup', function(tpl) {
				
				// Add popup content to bg div
				self.$el.html(tpl(self));

				// Get popup element
				self.popup = $('.popup-reset', self.$el);

				if ( !rerender ) {
					// Add the bg & popup to document
					$('body').append(self.$el);

		  			// Run animations
		  			self.show();
				} else {
					self.popup.show();
				}
				
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
					SSLIMS.unloadTemplate('sample_sheet/edit-sample-popup');

					self.remove();
				});
			});
		}
	});

	SSLIMS.WellInfoView = Backbone.View.extend({
		tagName: 'div',
		className: 'well-info',
		events: {
			'click .well-info-close': 'hide',
			'click .well-info-remove': 'removeMe',
			'click .well-info-view': 'view',
			'click .edit-config': 'editSampleConfig'
		},
		initialize: function(options) {
			this.model = options.model;
			this.well = options.well;
			this.orientation = options.orientation;
			this.removeEnabled = !_.isUndefined(options.removeEnabled) ? options.removeEnabled : true;
		},
		editSampleConfig: function() {
			new SSLIMS.EditSampleConfigPopupView({
				well: this.well,
				wellInfo: this
			});
		},
		view: function() {
			if ( this.removeEnabled ) {
				document.location = '#samples/' + this.model.get('id');
			} else {
				var runs = new SSLIMS.Runs(this.model.get('runs'));
				var r = runs.findWhere({sheet_id: this.model.get('sheet_id')});

				if ( _.isUndefined(r) ) {
					document.location = '#samples/' + this.model.get('id');
				} else {
					document.location = '#samples/' + this.model.get('id') + '/runs/' + r.get('id');
				}

			}
			
		},
		hide: function(e) {
			if ( !_.isUndefined(e) ) e.preventDefault();

			this.$el.fadeOut('fast');
			this.well.state.isOpen = false;
		},
		removeMe: function() {
			this.well.removeSample(true);
		},
		show: function() {
			this.$el.fadeIn('fast');
		},
		render: function() {
			this.$el.css('bottom', '50px');

			

			if ( SSLIMS.user.get('type') == 'customer' ) {
				this.$el.html("<span class=\"sample-name\">" + this.model.get('name') + "</span><span class=\"field\">DNA Type:</span> " + this.model.get('dna_type') + "<br /><span class=\"field\">Request:</span> " + this.model.get('request').name + "<br><span class=\"field\">Concentration:</span> " + this.model.get('concentration') + "ng/ul<br><input class=\"well-info-btn well-info-remove btn-red\" type=\"button\" value=\"Remove\"><input class=\"well-info-btn well-info-view btn-green\" type=\"button\" value=\"View\"><div class=\"well-info-triangle\"></div><a href=\"#\" class=\"well-info-close glyphicon glyphicon-remove\"></a>");
			} else {
				var config = _.isUndefined(this.well.state.modelData.config) ? 'Sheet Default' : this.well.state.modelData.config.alias;

				if ( this.well.sheet.edit ) {
					config += " <span class=\"edit-config\">Edit</span>";
				}

				this.$el.html("<span class=\"sample-name\">" + this.model.get('name') + " - Inx:" + this.model.get('inx') + "</span><span class=\"field\">Request:</span> <a href=\"#requests/" + this.model.get('request').id + "\">" + this.model.get('request').name + "</a><br /><span class=\"field\">DNA Type:</span> " + this.model.get('dna_type') + "<br /><span class=\"field\">Primer:</span> " + this.model.get('primer').name + "<br /><span class=\"field\">Concentration:</span> " + this.model.get('concentration') + "ng/ul<br><span class=\"field\">Config:</span> " + config + "<br /><div style=\"margin-bottom:14px;\"></div><input class=\"well-info-btn well-info-remove btn-red\" type=\"button\" value=\"Remove\"><input class=\"well-info-btn well-info-view btn-green\" type=\"button\" value=\"View\"><div class=\"well-info-triangle\"></div><a href=\"#\" class=\"well-info-close glyphicon glyphicon-remove\"></a>");
			}

			if ( !this.removeEnabled ) {
				$('.well-info-remove', this.$el).remove();

				//$('.well-info-view', this.$el).attr('value', 'View Run');
			}

			if ( this.orientation == 'bottom' ) {
				this.$el.css('top', '50px').css('bottom', '');
				$('.well-info-triangle', this.$el).attr('class', 'well-info-triangle-up');
			}



			return this;
		}
	});

	SSLIMS.WellView = Backbone.View.extend({
		tagName: 'div',
		className: 'well',
		events: {
			'mousedown': 'startDrag',
			'touchstart': 'startDrag',
			'click': 'showInfo'
		},
		initialize: function(options) {
			this.index = options.index;
			this.sheet = options.sheet;

			var stateKey = 'well_' + this.index;

			if ( _.isUndefined(SSLIMS.state[stateKey]) ) SSLIMS.state[stateKey] = {hasSample: false};
			this.state = SSLIMS.state[stateKey];
		},
		startDrag: function(e) {
			var target = $(e.target);

			if ( this.sheet.edit && this.state.hasSample && target.attr('class') == 'well selected' ) {
				this.sheet.hideAllWells();
				
				var handler = this.sheet.parent.dragStart(this.sheet.parent);

				handler(e, this.wellInfo.model);

				this.sheet.dragFromPlate = this;

				this.removeSample();
			}
		},
		showInfo: function(e) {
			if ( !_.isUndefined(e) ) var target = $(e.target);

			if ( !this.sheet.edit && this.state.hasSample && (_.isUndefined(e) || target.attr('class') == 'well selected') ) {
				this.sheet.hideAllWells();
				this.state.isOpen = true;
				this.wellInfo.show();
			}
		},
		dropSample: function(sampleModel, hide) {

			this.wellInfo = new SSLIMS.WellInfoView({model: sampleModel, removeEnabled: this.sheet.edit, well: this, orientation: ((this.index <= 35) ? 'bottom' : 'top')});

			this.state.hasSample = true;
			this.state.modelData = sampleModel.attributes;

			var wellEl = this.wellInfo.render().$el;
			if ( hide && !this.state.isOpen ) {
				wellEl.hide();
			} else {
				this.state.isOpen = true;
			}

			if ( !this.sheet.edit ) this.$el.css('cursor', 'pointer');

			this.$el.addClass("selected").append(wellEl);
		},
		removeSample: function(fromUI) {
			if ( this.state.hasSample ) {

				if ( fromUI ) {
					this.sheet.parent.sampleTable.unremoveItem(this.wellInfo.model.get('id'));
					this.sheet.parent.controlSampleTable.unremoveItem(this.wellInfo.model.get('id'));

					this.wellInfo.model.save({status: 'Received, ready to load'}, {success: function() {
						
					}});
				}

				this.$el.removeClass("selected");
				this.wellInfo.remove();
				this.state.hasSample = false;
				this.state.isOpen = false;
				delete this.wellInfo;
				delete this.state.modelData;
			}
		},
		render: function() {
			this.$el.html("<div class=\"well-label\">" + SSLIMS.wellIndexToVert(this.index) + "</div>");

			// Populate well from cache
			if ( this.state.hasSample ) {
				this.dropSample(new SSLIMS.Sample(this.state.modelData), true);
			}

			return this;
		}
	});

	SSLIMS.SampleSheetView = Backbone.View.extend({
		tagName: 'div',
		className: 'well-plate-view',
		events: {

		},
		initialize: function(options) {
			this.parent = options.parent;
			this.edit = _.isUndefined(options.edit) ? true : options.edit;

			if ( !this.edit ) {
				this.wellMap = options.wellMap;
				this.sampleCollection = options.preLoadSamples;
			}

			this.dragFromPlate = false;
		},
		sampleExists: function(sampleModel) {
			var self = this;

			var sampleExist = false;

			_.each(self.wells, function(well) {
				if ( !_.isUndefined(well.wellInfo) ) {
					var wellModel = well.wellInfo.model;

					if ( sampleModel.get('id') == wellModel.get('id') ) sampleExist = true;
				}
			});

			return sampleExist;
		},
		addWells: function() {
			var plate = $('#plate', this.$el);

			this.wells = [];

			for ( var n = 0; n < 96; n++ ) { 
				var well = new SSLIMS.WellView({index: n, sheet: this}).render();

				this.wells.push(well);

				plate.append(well.$el);
			}
		
			plate.append('<div class="clear"></div>');
		},
		loadSamples: function() {
			var self = this;

			this.sampleCollection.each(function(sample) {
				var wellIndex = self.wellMap[sample.get('id')];

				if ( !self.wells[wellIndex].state.hasSample ) self.wells[wellIndex].dropSample(sample, true);
			});

		},
		getSampleIDs: function() {
			var self = this;
			var sampleIDS = [];

			_.each(self.wells, function(well) {
				if ( !_.isUndefined(well.wellInfo) ) {
					var wellModel = well.wellInfo.model;

					sampleIDS.push(wellModel.get('id'));
				}
			});

			return sampleIDS;
		},
		getWellByCoords: function(coords) {
			var w = $(window);
			var i;

			$(".well", this.$el).each(function(index, element) {
				var top = $(element).offset().top - w.scrollTop();
				var left = $(element).offset().left - w.scrollLeft();
				
				if ( (top < coords.y) && ((top + 30) > coords.y) && (left < coords.x) && ((left + 30) > coords.x) && !$(this).hasClass('selected') ) {
					i = index;
					return false;
				}
			});

			return this.wells[i];
		},
		droppedWell: function(wellIndex, model) {
			var well = this.wells[wellIndex];

			this.hideAllWells();
			well.dropSample(model, true);
		},
		dropped: function(draggableSample) {
			var well = this.getWellByCoords(draggableSample.getCoords());

			if ( !_.isUndefined(well) ) {
				this.hideAllWells();
				well.dropSample(draggableSample.getModel());

			} else if ( this.dragFromPlate ) {
				this.dragFromPlate.dropSample(draggableSample.getModel());
			}

			if ( this.dragFromPlate == false && !_.isUndefined(well) ) {
				this.parent.sampleTable.removeItem(draggableSample.getModel().get('id'));
				this.parent.controlSampleTable.removeItem(draggableSample.getModel().get('id'));
			}

			this.dragFromPlate = false;
		},
		clearAllWells: function() {
			_.each(this.wells, function(well) {
				well.removeSample();
			});
		},
		hideAllWells: function() {
			_.each(this.wells, function(well) {
				if ( well.state.hasSample || well.state.isOpen ) well.wellInfo.hide();
			});
		},
		render: function(callback) {
			var self = this;

			callback = _.isUndefined(callback) ? function() {} : callback;

			SSLIMS.loadTemplate('sample_sheet/view', function(tpl) {

				self.$el.html(tpl(self));

				self.addWells();

				if ( !self.edit ) self.loadSamples();

				callback.call(self, self.$el);
				
				// Handle when the element is removed from DOM
				self.$el.on('destroyed', self.deleteView);
			}, true);

			

			return this;
		},
		deleteView: function() {
			SSLIMS.unloadTemplate('sample_sheet/view');
		}
	});

	

}(window.SSLIMS = window.SSLIMS || {}, jQuery));