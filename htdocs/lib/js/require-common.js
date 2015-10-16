requirejs_config_obj = {
    "baseUrl": "/lib/js",
    waitSeconds: 30,
    paths: {
        "jquery": "jquery-2.1.1",
        "rcloud_bundle": "../../js/rcloud_bundle",
        "ace": "../ace_bundle",
        editor_tab: "../../editor_tab",
        shell_tab: "../../shell_tab"
    },
    "shim": {
        "tree.jquery": ["jquery"],
        "jquery-ui": ["jquery"],
        laconic: ["jquery"],
        "jquery.cookies.2.2.0": ["jquery"],
        "jquery.bootpag" : ["jquery"],
        "jquery.scrollto": ["jquery"],
        "jquery.whiny": ["jquery"],
        "bootstrap": ["jquery"],
        "shell_tab": ["rcloud_bundle", "editor_tab"],
        "editor_tab": ["rcloud_bundle", "laconic", "tree.jquery"],
        "rserve": ["underscore"],
        "rcloud_bundle": ["ace", "jquery.cookies.2.2.0", "jquery.bootpag", "jquery.scrollto", "jquery-ui", "hl.min", "bootstrap"
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
    "hl.min", "jDataView", "jquery.cookies.2.2.0",
    "jquery.bootpag", "jquery.scrollto", "laconic", "jquery-ui",
    "bootstrap", "peg-0.6.2.min",
    "rserve", "tree.jquery", "FileSaver"
];

function start_require(deps) {
    try {
        require(deps,
                function(Promise, _, d3, sha256) {
                    window.Promise = Promise;
                    window._ = _;
                    window.d3 = d3;
                    window.sha256 = sha256;
                    main();

                });
    }
    catch(xep) {
        RCloud.UI.fatal_dialog("Sorry, the page timed out.", "Reload", window.location.href);
    }
}
