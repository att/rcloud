requirejs.config(requirejs_config_obj);

var deps = common_deps; 

deps.push(
    // rcloud's main.js and bundle
    "../../main", "rcloud_bundle",

    // rcloud's other files
    "../../shell_tab", "../../editor_tab"
);

start_require(deps);
