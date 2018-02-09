RCloud.UI.advanced_menu = (function() {
    var menu_;
    var result = {
        init: function() {
            menu_ = RCloud.UI.menu.create();
            menu_.init();
            // we want the object to derive from RCloud.UI.menu directly but alphabetical order blocks it
            d3.rebind(result, menu_, 'add', 'remove', 'check', 'uncheck', 'enable', 'create');
            RCloud.UI.menus.add({
                advanced_menu: {
                    sort: 5000,
                    type: 'menu',
                    title: 'Advanced',
                    modes: ['view', 'edit'],
                    menu: menu_
                }
            });
            menu_.add({
                open_in_github: {
                    sort: 1000,
                    text: "Open in GitHub",
                    modes: ['view', 'edit'],
                    disabled_reason: "The notebook source does not support a web interface",
                    action: function() {
                        shell.github_url().then(function(url) {
                            if(!url)
                                alert('Sorry, Open in GitHub is not supported for this notebook source.');
                            else
                                window.open(url, "_blank");
                        });
                    }
                },
                github_merge: {
                    sort: 1100,
                    text: "Merge notebook",
                    modes: ["edit"],
                    action: function() {
                        // let merger = new RCloud.UI.notebook_merger();
                        // merger.show_dialog();

                        new RCloud.UI.merger_factory().show_dialog();
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
                show_source: {
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
                    disabled_reason: "You can't publish someone else's notebook",
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
        }
    };
    return result;
})();

