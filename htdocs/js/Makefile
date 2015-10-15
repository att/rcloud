JS_COMPILER = ./node_modules/uglify-js/bin/uglifyjs

all: rcloud_bundle.js rcloud_bundle.min.js rcloud_bundle.js.gz rcloud_bundle.min.js.gz

rcloud_bundle.js: \
	rclient.js \
	rcloud.js \
	ui_utils.js \
        utils.js \
        extension.js \
	bootstrap_utils.js \
	notebook/_notebook_begin.js \
	notebook/_buffer_begin.js \
	notebook/_cell_begin.js \
	notebook/_asset_begin.js \
	notebook/buffer_model.js \
	notebook/asset_view.js \
	notebook/asset_model.js \
	notebook/asset_controller.js \
	notebook/cell_view.js \
	notebook/cell_model.js \
	notebook/cell_controller.js \
        notebook/cell_processors.js \
	notebook/notebook_view.js \
	notebook/notebook_model.js \
	notebook/notebook_controller.js \
	notebook/util.js \
	notebook.js \
	session.js \
	language.js \
	upload_utils.js \
	ui/_begin.js \
        ui/advanced_menu.js \
        ui/cell_commands.js \
	ui/column.js \
	ui/column_sizer.js \
	ui/command_prompt.js \
	ui/comments_frame.js \
	ui/configure_readonly.js \
	ui/fatal_dialog.js \
        ui/find_replace.js \
	ui/help_frame.js \
        ui/image_manager.js \
        ui/import_export.js \
	ui/init.js \
	ui/left_panel.js \
	ui/load_options.js \
        ui/menus.js \
	ui/middle_column.js \
        ui/navbar.js \
        ui/notebook_commands.js \
	ui/notebook_title.js \
	ui/notebooks_frame.js \
        ui/output_context.js \
	ui/panel_loader.js \
	ui/progress.js \
	ui/right_panel.js \
        ui/run_button.js \
	ui/scratchpad.js \
	ui/search.js \
	ui/session_pane.js \
	ui/settings_frame.js \
	ui/share_button.js \
	ui/upload.js \
	ui/upload_frame.js \
	ui/notebook_protection_logger.js \
	ui/notebook_protection.js \
	ui/discovery_page.js

rcloud_bundle.min.js: rcloud_bundle.js Makefile
	@rm -f $@
	$(JS_COMPILER) < $< > $@
	chmod -w $@

rcloud_bundle.js: Makefile
	echo $^
	@rm -f $@
	cat $(filter %.js,$^) > $@
ifeq ($(CHECK),1)
	jshint $(filter %.js,$(filter-out lib/%.js,$(filter-out %/_begin.js,$(filter-out %/_end.js, $^))))
endif
	chmod -w $@

rcloud_bundle.min.js.gz: rcloud_bundle.min.js
	gzip -c -9 $^ > $@

rcloud_bundle.js.gz: rcloud_bundle.js
	gzip -c -9 $^ > $@

clean:
	rm -f rcloud_bundle.js rcloud_bundle.min.js
