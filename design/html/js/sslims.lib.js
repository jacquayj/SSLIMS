
var UI = {
	TabGroup: function (el) {

		el.each(function(index, element) {
			$(".ui-tab-content:eq(0)", element).show();

			$(".ui-tabs a", element).click(function() {

				var li = $(this).parent();
				var index = li.index();

				$(".ui-tab-content", element).hide();
				$(".ui-tabs li", element).removeClass("selected");

				li.addClass("selected");
				$(".ui-tab-content:eq(" + index + ")", element).show();
			});
		});
	},
	Popup: function(el) {

		var that = this;
		this.el = el;

		$(window).resize(function() {
			var doc_height = $(this).height();
			var el_height = that.el.height();
			var margin_top = (doc_height / 2) - ((el_height + 60) / 2);

			that.el.css("margin-top", margin_top + "px");
		});

		this.show = function() {
			this.el.each(function(index, element) {
				element = $(element);
				var bg = element.parent();

				bg.fadeIn(250, function() {
					element.show();

					var el_height = element.height();
					var doc_height = $(window).height();

					var margin_top = (doc_height / 2) - ((el_height + 60) / 2);

					element.css("margin-top", margin_top + "px");
					element.hide();
					element.css('visibility', 'visible');

					element.slideDown(300);
				});
			});
		};

		this.hide = function() {
			this.el.each(function(index, element) {
				element = $(element);
				var bg = element.parent();

				element.slideUp(300, function() {
					bg.fadeOut(250);
					element.css('visibility', 'hidden');
				});
			});
		};

		$(".ui-popup-close", this.el).click(function() {
			that.hide();
		});
	}
};
