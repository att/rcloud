requirejs.config(requirejs_config_obj);

var deps = common_deps;

deps.push(
    // rcloud's edit.js and bundle
    "../../edit", "../../fiddle.js", "rcloud_bundle",

    // rcloud's other files
    "shell_tab", "editor_tab"
);

start_require(deps);

function main() { $.getScript('/fiddle.js', function () {}) }