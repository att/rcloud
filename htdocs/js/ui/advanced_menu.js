RCloud.UI.advanced_menu = (function() {
    var menu_ = RCloud.UI.menu.create();
    var menu_init = menu_.init;
    menu_.init = function() {
        menu_init.call(menu_);
        RCloud.UI.menus.add({
            advanced_menu: {
                sort: 1000,
                menu: menu_
            }
        });
        menu_.add({
            open_in_github: {
                sort: 1000,
                text: "Open in GitHub",
                modes: ['view', 'edit'],
                action: function() {
                    window.open(shell.github_url(), "_blank");
                }
            },
            open_from_github: {
                sort: 2000,
                text: "Load Notebook by ID",
                modes: ['edit'],
                action: function() {
                    var result = prompt("Enter notebook ID or github URL:");
                    if(result !== null)
                        shell.open_from_github(result);
                }
            },
            show_source: { // just here temporarily for refactoring
                sort: 9000,
                text: "Show Source",
                checkbox: true,
                value: true,
                modes: ['view'],
                action: function(value) {
                    if(value)
                        shell.notebook.controller.show_r_source();
                    else
                        shell.notebook.controller.hide_r_source();
                }
            },
            publish_notebook: {
                sort: 10000,
                text: "Publish Notebook",
                checkbox: true,
                modes: ['edit'],
                action: function(value) {
                    function publish_success(gistname, un) {
                        return function(val) {
                            if(!val)
                                console.log("Failed to " + (un ? "un" : "") + "publish notebook " + gistname);
                        };
                    }
                    if(value) {
                        rcloud.publish_notebook(editor.current().notebook)
                            .then(publish_success(editor.current().notebook, false));
                    }
                    else {
                        rcloud.unpublish_notebook(editor.current().notebook)
                            .then(publish_success(editor.current().notebook, true));
                    }
                }
            }
        });
        return menu_;
    };
    return menu_;
})();

