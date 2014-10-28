requirejs_config_obj = {
    "baseUrl": "/lib/js",
    waitSeconds: 30,
    paths: {
        "jquery": "../../shared.R/jquery",
        "rcloud_bundle": "../../js/rcloud_bundle",
        "selectize": "../../shared.R/selectize/js/selectize.min",
        "datatables": "../../shared.R/datatables/js/jquery.dataTables.min"
    },
    "shim": {
        datatables: {
            deps: ['jquery'],
            exports: "jQuery.fn.dataTable"
        },
        "jquery.cookies.2.2.0": ["jquery"],
        "rserve": ["underscore"],
        "rcloud_bundle": ["jquery.cookies.2.2.0"]
    }
};

var deps = [
    "bluebird", "underscore", "rserve", "../../mini", "rcloud_bundle", "datatables", "selectize"
];

function start_require(deps) {
    require(deps,
        function(Promise) {
            window.Promise = Promise;
            main();
        });
}

requirejs.config(requirejs_config_obj);
console.log("SHINY");
start_require(deps);
