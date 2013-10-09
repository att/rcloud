function init_shareable_link_box() {
    $("#share-notebook").each(function() {
        var t = $(this), n = t.next(".embed-box"), f = function() {
            t.toggle();
            n.toggle();
            if (n.is(":visible")) {
                n.get(0).value = window.location.protocol + '//' + window.location.host + '/view.html?notebook=' + shell.gistname();
                var v = shell.version();
                if(v)
                    n.get(0).value = n.get(0).value + '&version='+v;
                n.get(0).select();
            }
            return false;
        };
        t.click(f); n.blur(f);
    });
}

function init_editable_title_box() {
    $("#notebook-title").click(function() {
        var result = prompt("Please enter the new name for this notebook:", $(this).text());
        if (result !== null) {
            $(this).text(result);
            editor.rename_notebook(shell.gistname(), result);
        }
    });
}

function init_fork_revert_button() {
    $("#fork-revert-notebook").click(function() {
        shell.fork_or_revert_button();
    });
}

function init_github_buttons() {
    $("#open-in-github").click(function() {
        shell.open_in_github();
    });
    $("#open-from-github").click(function() {
        var result = prompt("Enter notebook ID or github URL:");
        if(result !== null)
            shell.open_from_github(result);
    });
}

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
    init_shareable_link_box();
    init_editable_title_box();
    init_fork_revert_button();
    init_github_buttons();
    footer.init();
    
    $("#show-source").font_awesome_checkbox({
        checked: false,
        check: function() {
            shell.notebook.controller.show_r_source();
        }, uncheck: function() {
            shell.notebook.controller.hide_r_source();
        }
    });

    $("#comment-submit").click(function() {
        editor.post_comment($("#comment-entry-body").val());
        return false;
    });
    rclient = RClient.create({
        debug: false,
        host: (location.protocol == "https:") ? ("wss://"+location.hostname+":8083/") : ("ws://"+location.hostname+":8081/"),
        on_connect: function(ocaps) {
            rcloud = RCloud.create(ocaps.rcloud);

            rcloud.anonymous_session_init(function(hello) {
                rcloud.graphics.set_device_pixel_ratio(window.devicePixelRatio, function() {});
            });

            rcloud.init_client_side_data();

            editor.init();
            shell.init();

            if (location.search.length > 0) {
                function getURLParameter(name) {
                    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
                }
                editor.load_notebook(
                    getURLParameter("notebook"), getURLParameter("version"), 
                    function() {
                        shell.notebook.controller.run_all();
                    });
                $("#tabs").tabs("select", "#tabs-2");
            }
        }
    });
}

window.onload = main_init;
