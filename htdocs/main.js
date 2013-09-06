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

var oob_handlers = {
    "browsePath": function(v) {
        $("#help-output").empty();
        $("#help-output").append("<iframe class='help-iframe' src='" + window.location.protocol + '//' + window.location.host + v+ "'></iframe>");
    }
};

function main_init() {
    init_shareable_link_box();
    init_editable_title_box();
    init_fork_revert_button();
    footer.init();
    $("#show-source").click(function() {
        var this_class = $(this).attr("class");
        if (this_class === 'icon-check') {
            $(this).addClass('icon-check-empty');
            $(this).removeClass('icon-check');
            shell.notebook.controller.hide_r_source();
        } else {
            $(this).addClass('icon-check');
            $(this).removeClass('icon-check-empty');
            shell.notebook.controller.show_r_source();
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
            rcloud.session_init(rcloud.username(), rcloud.github_token(), function(hello) {
                rclient.post_response(hello);
            });

            $("#new-md-cell-button").click(function() {
                shell.new_markdown_cell("", "markdown");
                var vs = shell.notebook.view.sub_views;
                vs[vs.length-1].show_source();
            });
            $("#rcloud-logout").click(function() {
		// let the server-side script handle this so it can
		// also revoke all tokens
                window.location.href = '/logout.R';
            });
            $(".collapse").collapse();
            $("#upload-submit").click(function() {
              rcloud.upload_file();
            });
            rcloud.init_client_side_data();

            editor.init();

            if (location.search.length > 0) {
                function getURLParameter(name) {
                    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
                }
                editor.load_notebook(getURLParameter("notebook"), getURLParameter("version"));
                $("#tabs").tabs("select", "#tabs-2");
            }
        },
        on_data: function(v) {
            v = v.value.json();
            oob_handlers[v[0]] && oob_handlers[v[0]](v.slice(1));
        },
        on_oob_message: function(v, callback) {
            try {
                v = v.value.json();
                oob_msg_handlers[v[0]] && oob_msg_handlers[v[0]](v.slice(1), callback);
            } catch (e) {
                callback(String(e), true);
            }
        }
    });
}

window.onload = main_init;
