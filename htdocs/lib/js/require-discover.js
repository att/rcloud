requirejs.config(requirejs_config_obj);

var deps = common_deps;

deps.push(
    "../../discover", "rcloud_bundle",

    // rcloud's other files
    "shell_tab", "discover_tab"
);

start_require(deps);
