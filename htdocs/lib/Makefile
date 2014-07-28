JS_COMPILER = ./node_modules/uglify-js/bin/uglifyjs

all: ace_bundle.js ace_bundle.min.js dependencies_bundle.js dependencies_bundle.min.js

ace_bundle.js:	\
	js/ace/_begin.js \
	js/ace/ace.js \
	js/ace/theme-chrome.js \
	js/ace/mode-r.js \
	js/ace/rmarkdown_highlight_rules.js \
	js/ace/rmarkdown.js \
	js/ace/r_code_model.js \
	js/ace/r_scope_tree.js \
	js/ace/mode-markdown.js \
        js/ace/sweave_background_highlighter.js \
	js/ace/ext-language_tools.js \
	js/ace/ext-searchbox.js \
	js/ace/mode-javascript.js \
	js/ace/mode-python.js \
	js/ace/mode-sh.js \
	js/ace/_end.js


# requirejs must go before anything else
dependencies_bundle.js: \
	js/require.js \
	js/bluebird.js \
	js/colorbrewer.js \
	js/d3.js \
	js/dataframe.js \
	js/dcplot.js \
	js/hl.min.js \
	js/jquery-1.10.2.js \
	js/bootstrap.js \
	js/jquery-ui.min.js \
	js/jquery.cookies.2.2.0.js \
	js/jquery.scrollto.js \
	js/laconic.js \
	js/underscore.js \
	js/rserve.js \
	js/tree.jquery.js

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
	echo Note: dependencies_bundle is obsolete and unused!

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
