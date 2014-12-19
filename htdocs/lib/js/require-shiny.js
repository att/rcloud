requirejs_config_obj = {
    "baseUrl": "/lib/js",
    waitSeconds: 30,
    paths: {
        "jquery": "../../shared.R/shared/jquery",
        "rcloud_bundle": "../../js/rcloud_bundle",
        "mini": "../../mini",
        "selectize": "../../shared.R/shared/selectize/js/selectize.min",
        "datatables": "../../shared.R/shared/datatables/js/jquery.dataTables.min"
    },
    "shim": {
        datatables: {
            deps: ['jquery'],
            exports: "jQuery.fn.dataTable"
        },
        "jquery.cookies.2.2.0": ["jquery"],
        "rserve": ["underscore"],
        "mini": ["rcloud_bundle"],
        "rcloud_bundle": ["jquery.cookies.2.2.0"]
    }
};

var deps = [
    "bluebird", "underscore", "d3", "rserve", "mini", "rcloud_bundle", "datatables", "selectize"
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
