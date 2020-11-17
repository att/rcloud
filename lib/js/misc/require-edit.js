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

// defer angular initialization
window.name = "NG_DEFER_BOOTSTRAP!";

var deps = common_deps;

deps.push(
    // rcloud's edit.js and bundle
    "../../edit", "rcloud_bundle",

    // rcloud's other files
    "shell_tab", "editor_tab", "merger_bundle"
);

start_require(deps);
