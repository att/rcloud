JS_COMPILER = ./node_modules/uglify-js/bin/uglifyjs

all: rcloud_bundle.js rcloud_bundle.min.js

rcloud_bundle.js: \
	plot.js \
	chart.js \
	facet_chart.js \
	websockets.js \
	rclient.js \
	buffer.js \
	parse.js \
	peg_parser.js \
	objs.js \
	Rsrv.js \
	rcloud.js \
	notebook.js

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
