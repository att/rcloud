Promise.longStackTraces();

var oob_handlers = {
    "browsePath": function(v) {
        var x=" "+ window.location.protocol + "//" + window.location.host + v+" ";
        var width=600;
        var height=500;
        var left=screen.width-width;
        window.open(x,'RCloudHelp','width='+width+',height='+height+',scrollbars=yes,resizable=yes,left='+left);
    }
};

function main_init() {
    RCloud.UI.init();

    RCloud.session.init();

    // function getURLParameter(name) {
    //     return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    // }

    // rclient = RClient.create({
    //     debug: false,
    //     host:  location.href.replace(/^http/,"ws").replace(/#.*$/,""),
    //     on_connect: function(ocaps) {
    //         rcloud = RCloud.create(ocaps.rcloud);
    //         if (!rcloud.authenticated) {
    //             rclient.post_error(rclient.disconnection_error("Please login first!"));
    //             rclient.close();
    //             return;
    //         }
    //         rcloud.session_init(rcloud.username(), rcloud.github_token()).then(function(hello) {
    //             rclient.post_response(hello);
    //         });
    //         rcloud.display.set_device_pixel_ratio();

    //         $(".collapse").collapse();
    //         rcloud.init_client_side_data();

    //         shell.init();
    //         var notebook = null, version = null;
    //         if (location.search.length > 0) {
    //             notebook = getURLParameter("notebook");
    //             version = getURLParameter("version");
    //         }
    //         editor.init(notebook, version);
    //         /*
    //          // disabling navigation for now - concurrency issues
    //         window.addEventListener("popstate", function(e) {
    //             if(e.state === "rcloud.notebook") {
    //                 var notebook2 = getURLParameter("notebook");
    //                 var version2 = getURLParameter("version");
    //                 editor.load_notebook(notebook2, version2, true, false);
    //             }
    //         });
    //          */
    //     },
    //     on_data: function(v) {
    //         v = v.value.json();
    //         oob_handlers[v[0]] && oob_handlers[v[0]](v.slice(1));
    //     }
    // });
}

window.onload = main_init;
// Promise.onPossiblyUnhandledRejection(function(error){
//     throw error;
// });
