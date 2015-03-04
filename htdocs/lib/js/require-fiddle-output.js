requirejs.config(requirejs_config_obj);

var deps = common_deps;

deps.push(
    // rcloud's fiddle.js and bundle
		"rcloud_bundle"
);

start_require(deps);

function main() { 
	$.getScript('/fiddle.js', function () {
		if(window.start) {
			window.start();
		}
	}); 
}
