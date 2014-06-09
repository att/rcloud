Notebook.Asset.create_html_view = function (asset_model) {
	var filename_div = $("<li></li>");
	var anchor = $("<a href='#'></a>");
	var filename_span = $("<span>" + asset_model.filename() + "</span>")
	var remove = ui_utils.fa_button("icon-remove", "remove", '', {
		'position': 'relative',
		'left': '2px',
		'opacity': '0.75'
	}, true);
	anchor.append(filename_span);
	filename_div.append(anchor);
	anchor.append(remove);

	//issue	#387 : added keypress event triggering the recreation operation
	var asset_old_name = "";
	filename_span.keypress(function (e) {
		if (e.which == 13) {
			filename_span.attr("contenteditable", "false");
			//get new asset name
			var new_asset_name = filename_span.text();
			//get old asset content
			var old_asset_contet = asset_model.content();
			//create new asset
			if (new_asset_name == "") {
				filename_span.text(asset_old_name);
				return;
			}
			if (Notebook.is_part_name(new_asset_name)) {
				alert("Asset names cannot start with 'part[0-9]', sorry!");
				filename_span.text(asset_old_name);
				return;
			}
			var found = shell.notebook.model.has_asset(new_asset_name);
			if (found)
				found.controller.select();
			else {
				shell.notebook.controller
					.append_asset(old_asset_contet, new_asset_name)
					.then(function (controller) {
						controller.select();
					});
				//delete old asset after creating new one
				asset_model.controller.remove(true);
			}
		}
	});
	anchor.click(function () {
		// amol : added if-else conditions : github issue #387
		if (!asset_model.active(true))
			filename_span.attr("contenteditable", "true");
		else
			asset_model.controller.select();
	});
	remove.click(function () {
		asset_model.controller.remove();
	});

	var result = {
		div: filename_div,
		filename_updated: function () {
			anchor.text(asset_model.filename());
		},
		content_updated: function () {
			if (asset_model.active())
				RCloud.UI.scratchpad.content_updated();
		},
		language_updated: function () {
			if (asset_model.active())
				RCloud.UI.scratchpad.language_updated();
		},
		active_updated: function () {
			if (asset_model.active())
				filename_div.addClass("active");
			else
				filename_div.removeClass("active");
		},
		self_removed: function () {
			filename_div.remove();
		},
		set_readonly: function (readonly) {
			if (asset_model.active())
				RCloud.UI.scratchpad.set_readonly(readonly);
			if (readonly)
				remove.hide();
			else
				remove.show();
		},
		div: function () {
			return filename_div;
		}
	};
	return result;
};