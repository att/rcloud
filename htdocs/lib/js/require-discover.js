requirejs.config(requirejs_config_obj);

var deps = common_deps;

deps.push(
    "../../discover", "rcloud_bundle", "shell_tab"
);

start_require(deps);
