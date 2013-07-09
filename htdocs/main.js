function init_shareable_link_box() {
    $(".embed-link").each(function() {
        var t = $(this), n = t.next(".embed-box"), f = function() {
            t.toggle(); 
            n.toggle();
            if (n.is(":visible")) {
                n.get(0).value = window.location.protocol + '//' + window.location.host + '/view.html?notebook=' + shell.gistname;
                n.get(0).select();
            }
            return false;
        };
        t.click(f); n.blur(f);
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
    rclient = RClient.create({ 
        debug: false,
        host: (location.protocol == "https:") ? ("wss://"+location.hostname+":8083/") : ("ws://"+location.hostname+":8081/"), 
        on_connect: function() {
            $("#new-md-cell-button").click(function() {
                shell.terminal.disable();
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
            $("#input-text-search").click(function() {
                shell.terminal.disable();
            });
            rcloud.init_client_side_data();

            editor.init();

            if (location.search.length > 0) {
                function getURLParameter(name) {
                    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
                }
                editor.load_notebook(getURLParameter("notebook"));
                $("#tabs").tabs("select", "#tabs-2");
            }
        }, on_data: function(v) {
            v = v.value.json();
            oob_handlers[v[0]] && oob_handlers[v[0]](v.slice(1));
        }
    });
}

window.onload = main_init;
