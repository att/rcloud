requirejs.config(requirejs_config_obj);

var deps = common_deps;

deps.push(
    "../../discover", "rcloud_bundle",

    // rcloud's other files
    "shell_tab", "editor_tab"
);

start_require(deps);
