requirejs.config({
    "baseUrl": "lib/js",
    paths: {
        "jquery": "jquery-1.10.2",
        "rcloud_bundle": "../../js/rcloud_bundle",
        "ace": "../ace_bundle"
    },
    "shim": {
        "crossfilter": {
            deps: [],
            exports: "crossfilter"
        },
        "tree.jquery": ["jquery"],
        "jquery-ui-1.10.4.custom": ["jquery"],
        laconic: ["jquery"],
        "jquery.cookies.2.2.0": ["jquery"],
        "jquery.scrollto": ["jquery"],
        "bootstrap": ["jquery"],
        "../../shell_tab": ["rcloud_bundle", "../../editor_tab"],
        "../../editor_tab": ["rcloud_bundle", "laconic"],
        "rcloud_bundle": ["ace", "dc"]
    }
});

var deps = [
    // AMD-compatible
    "bluebird", "lux", "underscore",
    "d3", "dc", "dcplot", "dataframe", "wdcplot",
    // soon-to-be-amdized
    "jquery-1.10.2",
    // other
    "crossfilter",
    "hl.min", "jDataView", "jquery.cookies.2.2.0",
    "jquery.scrollto", "laconic", "jquery-ui-1.10.4.custom",
    "bootstrap", "peg-0.6.2.min",
    "rserve", "tree.jquery",

    // rcloud's main.js and bundle
    "../../main", "rcloud_bundle",

    // rcloud's other files
    "../../shell_tab", "../../editor_tab"
];

require(deps,
        function(Promise, Lux, _, d3) {
            window.Promise = Promise;
            window.Lux = Lux;
            window._ = _;
            window.d3 = d3;
            main();
        });
