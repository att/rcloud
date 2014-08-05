requirejs_config_obj = {
    "baseUrl": "/lib/js",
    waitSeconds: 30,
    paths: {
        "jquery": "jquery-1.10.2",
        "rcloud_bundle": "../../js/rcloud_bundle",
        "ace": "../ace_bundle"
    },
    "shim": {
        "tree.jquery": ["jquery"],
        "jquery-ui": ["jquery"],
        laconic: ["jquery"],
        "jquery.cookies.2.2.0": ["jquery"],
        "jquery.scrollto": ["jquery"],
        "bootstrap": ["jquery"],
        "../../shell_tab": ["rcloud_bundle", "../../editor_tab"],
        "../../editor_tab": ["rcloud_bundle", "laconic", "tree.jquery"],
        "rserve": ["underscore"],
        "rcloud_bundle": ["ace", "jquery"]
    }
};

var common_deps = [
    // AMD-compatible
    "bluebird", "underscore", "d3", "sha256",
    // soon-to-be-amdized
    "jquery-1.10.2",
    // other
    "hl.min", "jDataView", "jquery.cookies.2.2.0",
    "jquery.scrollto", "laconic", "jquery-ui",
    "bootstrap", "peg-0.6.2.min",
    "rserve", "tree.jquery"
];

function start_require(deps) {
    require(deps,
            function(Promise, _, d3, sha256) {
                window.Promise = Promise;
                window._ = _;
                window.d3 = d3;
                window.sha256 = sha256;
                main();
            });
}
