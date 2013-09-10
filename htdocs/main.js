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

var oob_msg_handlers = {
    "password": function(v, callback) {
        var x = prompt(v);
        callback(x);
    }
};

function main_init() {
    init_shareable_link_box();
    init_editable_title_box();
    init_fork_revert_button();
    
    $("#scroll_search").hide();
    
    rclient = RClient.create({
        debug: false,
        host: (location.protocol == "https:") ? ("wss://"+location.hostname+":8083/") : ("ws://"+location.hostname+":8081/"),
        on_connect: function() {
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
            console.log("ON OOB MESSAGE");
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
