function init_shareable_link_box() {
    $(".embed-link").each(function() {
        var t = $(this), n = t.next(".embed-box"), f = function() {
            t.toggle(); 
            n.toggle();
            if (n.is(":visible")) {
                n.get(0).value = window.location.protocol + '//' + window.location.host + '/view.html?filename=' + shell.gistname;
                n.get(0).select();
            }
            return false;
        };
        t.click(f); n.blur(f);
    });
}

function main_init() {
    init_shareable_link_box();
    rclient = RClient.create({ 
        debug: false,
        host: "ws://"+location.hostname+":8081/", 
        on_connect: function() {
            $("#new-md-cell-button").click(function() {
                shell.terminal.disable();
                shell.new_markdown_cell("", "markdown");
                var vs = shell.notebook.view.sub_views;
                vs[vs.length-1].show_source();
            });
            $("#rcloud-logout").click(function() {
                $.cookies.set('user', null);
                $.cookies.set('sessid', null);
                window.location.href = '/login.html';
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
                editor.load_notebook(getURLParameter("user"), getURLParameter("filename"));
                $("#tabs").tabs("select", "#tabs-2");
            }
        }
    });
}

window.onload = main_init;
