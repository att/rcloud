requirejs_config_obj = {
    "baseUrl": "/lib/js",
    waitSeconds: 30,
    paths: {
        "jquery": "../../disabled",
        "rcloud_bundle": "../../js/rcloud_bundle",
        "mini": "../../mini.shiny"
    },
    "shim": {
        "jquery.cookies.2.2.0": ["jquery"],
        "rserve": ["underscore"],
        "mini": ["rcloud_bundle"],
        "rcloud_bundle": ["jquery.cookies.2.2.0"]
    }
};

var deps = [
    "bluebird", "underscore", "d3", "rserve", "mini", "rcloud_bundle"
];

function start_require(deps) {
    require(deps,
        function(Promise, _, d3) {
            window.Promise = Promise;
            window._ = _;
            window.d3 = d3;
            main();
        });
}

requirejs.config(requirejs_config_obj);
console.log("SHINY");
start_require(deps);