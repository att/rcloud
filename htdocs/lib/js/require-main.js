requirejs.config({
    "baseUrl": "lib/js",
    paths: {
        "jquery": "jquery-1.10.2",
        "rcloud_bundle": "../../js/rcloud_bundle",
        "ace": "../ace_bundle"
    },
    "shim": {
        "tree.jquery": ["jquery"],
        "jquery-ui-1.10.4.custom": ["jquery"],
        "jquery.cookies.2.2.0": ["jquery"],
        "jquery.scrollto": ["jquery"],
        "bootstrap": ["jquery"],
        "dc": ["d3.v3"],
        "dcplot": ["dc"],
        "../../wdcplot": ["dcplot"],
        "../../shell_tab": ["rcloud_bundle", "../../editor_tab"],
        "../../editor_tab": ["rcloud_bundle"],
        "rcloud_bundle": ["ace"]
    }
});

var deps = [
    // AMD-compatible
    "bluebird", "lux", "underscore",
    // soon-to-be-amdized
    "jquery-1.10.2", "d3.v3",
    // other
    "crossfilter", "dataframe", "dc", "dcplot", "../../wdcplot",
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
        function(Promise, Lux, _) {
            window.Promise = Promise;
            window.Lux = Lux;
            window._ = _;
            main();
        });
