JS_COMPILER = ./node_modules/uglify-js/bin/uglifyjs

all: ace_bundle.js ace_bundle.min.js dependencies_bundle.js dependencies_bundle.min.js

ace_bundle.js:	\
	js/ace/ace.js \
	js/ace/theme-chrome.js \
	js/ace/mode-r.js \
	js/ace/rmarkdown_highlight_rules.js \
	js/ace/rmarkdown.js \
	js/ace/r_code_model.js \
	js/ace/r_scope_tree.js \
	js/ace/mode-markdown.js \
        js/ace/sweave_background_highlighter.js

dependencies_bundle.js: \
	js/jquery-1.7.1.js \
	js/jquery.cookies.2.2.0.js \
	js/tree.jquery.js \
	js/jquery-ui-1.8.18.custom.min.js \
	js/underscore-min.js \
	js/d3.v2.js \
	js/lux.js \
	js/crossfilter.js \
	js/dc.js \
	js/colorbrewer.js \
	js/dcplot/dataframe.js \
	js/dcplot/dcplot.js \
	js/rserve.js \
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
