requirejs.config(requirejs_config_obj);

requirejs.config({
    paths: {
        "angular": "angular",
        "angular-selectize": "angular-selectize",
        "selectize": "selectize"
    },
    "shim": {
        'angular': {
            exports: "angular",
            'deps': ['jquery']
        },
        "angular-selectize": ["angular", "selectize"]
    }
});



var deps = common_deps;

deps.push(
    // rcloud's view.js and bundle
    "../../discover", "rcloud_bundle",

    // rcloud's other files
    "shell_tab", "editor_tab"
);

start_require(deps);
