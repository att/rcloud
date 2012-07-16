JS_COMPILER = ./node_modules/uglify-js/bin/uglifyjs

all: ace_bundle.js ace_bundle.min.js dependencies_bundle.js dependencies_bundle.min.js

ace_bundle.js:	\
	js/ace/ace-uncompressed.js \
	js/ace/themes/theme-chrome.js \
	js/ace/acesupport/acemode/r.js \
	js/ace/acesupport/acemode/r_background_highlighter.js \
	js/ace/acesupport/acemode/r_code_model.js \
	js/ace/acesupport/acemode/r_highlight_rules.js \
	js/ace/acesupport/acemode/r_scope_tree.js \
	js/ace/acesupport/acemode/tex.js \
	js/ace/acesupport/acemode/tex_highlight_rules.js \
	js/ace/acesupport/acemode/auto_brace_insert.js

dependencies_bundle.js: \
	js/jquery-1.7.1.min.js \
	js/jquery.cookies.2.2.0.js \
	js/tree.jquery.js \
	js/jquery-ui-1.8.18.custom.min.js \
	js/underscore-min.js \
	js/jquery.terminal-0.4.7.js \
	js/d3.v2.js \
	js/facet.js \
	js/colorbrewer.js \
	js/jDataView.js \
	js/hl.min.js \
	js/bootstrap.js \
	js/bootstrap-transition.js \
	js/bootstrap-tooltip.js \
	js/bootstrap-collapse.js

ace_bundle.min.js: ace_bundle.js Makefile
	@rm -f $@
	$(JS_COMPILER) < $< > $@
	chmod -w $@

ace_bundle.js: Makefile
	echo $^
	@rm -f $@
	cat $(filter %.js,$^) > $@
ifeq ($(CHECK),1) 
	jshint $(filter %.js,$(filter-out lib/%.js,$(filter-out %/_begin.js,$(filter-out %/_end.js, $^))))
endif
	chmod -w $@

dependencies_bundle.min.js: dependencies_bundle.js Makefile
	@rm -f $@
	$(JS_COMPILER) < $< > $@
	chmod -w $@

dependencies_bundle.js: Makefile
	echo $^
	@rm -f $@
	cat $(filter %.js,$^) > $@
ifeq ($(CHECK),1) 
	jshint $(filter %.js,$(filter-out lib/%.js,$(filter-out %/_begin.js,$(filter-out %/_end.js, $^))))
endif
	chmod -w $@

clean:
	rm -f ace_bundle.js ace_bundle.min.js dependencies_bundle.js dependencies_bundle.min.js
