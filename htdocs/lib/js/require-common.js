requirejs_config_obj = {
    "baseUrl": "/lib/js",
    waitSeconds: 30,
    paths: {
        "jquery": "jquery-2.1.1",
        "rcloud_bundle": "../../js/rcloud_bundle",
        "ace": "../ace_bundle",
        editor_tab: "../../editor_tab",
        discover_model: "../../discover_model",
        shell_tab: "../../shell_tab",
        "angular": "angular",
        "angular-selectize": "angular-selectize",
        "selectize": "selectize"
    },
    "shim": {
        "tree.jquery": ["jquery"],
        "jquery-ui": ["jquery"],
        laconic: ["jquery"],
        "jquery.cookies.2.2.0": ["jquery"],
        "jquery.bootpag" : ["jquery"],
        "jquery.scrollto": ["jquery"],
        "jquery.whiny": ["jquery"],
        "bootstrap": ["jquery-ui", "jquery"],
        "shell_tab": ["rcloud_bundle", "editor_tab"],
        "editor_tab": ["rcloud_bundle", "laconic", "tree.jquery"],
        "discover_tab": ["rcloud_bundle", "laconic", "tree.jquery"],
        "rserve": ["underscore"],
        "mousetrap-global-bind.min": ["mousetrap.min"],
        "jquery.fix.clone" : ["jquery-ui"],
        "rcloud_bundle": ["ace", "jquery.cookies.2.2.0", "jquery.bootpag", "jquery.scrollto", "jquery-ui", "hl.min", "bootstrap", "mousetrap.min"
                          // ,"jquery.whiny" // enable/disable jquery.whiny here
                         ]
    }
};

var common_deps = [
    // AMD-compatible
    "bluebird", "underscore", "d3", "sha256",
    // soon-to-be-amdized
    "jquery",
    // other
    "hl.min", "jquery.cookies.2.2.0",
    "jquery.bootpag", "jquery.scrollto", "laconic", "jquery-ui", "jquery.fix.clone",
    "bootstrap", "peg-0.6.2.min",
    "rserve", "tree.jquery", "FileSaver",
    "css_browser_selector",
    "mousetrap.min",
    "mousetrap-global-bind.min"
];

function start_require(deps) {
    requirejs.onError = function (err) {
        if (err.requireType === 'timeout') {
            var	lines =	err.toString().split('\n');
            lines = lines.slice(0, lines.length-1); // don't include link to confusing requirejs docs
            if(window.RCloud)
                RCloud.UI.fatal_dialog(["Sorry, the page timed out."].concat(lines).join('\n'), "Reload", window.location.href);
            else {
                lines.unshift('Ooops, please reload');
                var main = document.getElementById('main-div');
                main.innerHTML = '<pre>' + lines.join('\n') + '</pre>';
            }
        }
        else {
            throw err;
        }
    };

    require(deps,
            function(Promise, _, d3, sha256) {
                window.Promise = Promise;
                window._ = _;
                window.d3 = d3;
                window.sha256 = sha256;
                main();
	    });
}
