requirejs.config(requirejs_config_obj);

var deps = common_deps;

deps.push(
    // rcloud's mini.js and bundle
    "../../mini", "rcloud_bundle"
);
console.log("MINI");
start_require(deps);
