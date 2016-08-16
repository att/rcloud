requirejs.config(requirejs_config_obj);

var deps = common_deps;

deps.push(
    "../../discover", "rcloud_bundle", "shell_tab", "CustomElements.min", "time-element"
);

start_require(deps);
