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
    // rcloud's view.js and window.name = "NG_DEFER_BOOTSTRAP!"; bundle
    "../../discover", "rcloud_bundle",

    // rcloud's other files
    "shell_tab", "editor_tab"
);

start_require(deps);
