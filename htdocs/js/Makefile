JS_COMPILER = ./node_modules/uglify-js/bin/uglifyjs

all: rcloud_bundle.js rcloud_bundle.min.js

rcloud_bundle.js: \
	rclient.js \
	rcloud.js \
	ui_utils.js \
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
	notebook/notebook_view.js \
	notebook/notebook_model.js \
	notebook/notebook_controller.js \
	notebook/util.js \
	notebook.js \
	session.js \
	upload_utils.js \
	ui/_begin.js \
	ui/column.js \
	ui/command_prompt.js \
	ui/configure_readonly.js \
	ui/fatal_dialog.js \
	ui/help_frame.js \
	ui/init.js \
	ui/left_panel.js \
	ui/load.js \
	ui/middle_column.js \
	ui/notebook_title.js \
	ui/progress.js \
	ui/right_panel.js \
	ui/scratchpad.js \
	ui/search.js \
	ui/session_pane.js \
	ui/share_button.js \
	ui/upload.js

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

clean:
	rm -f rcloud_bundle.js rcloud_bundle.min.js
