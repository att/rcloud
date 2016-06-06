function main() {
    Promise.longStackTraces();

    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    }

    shell.is_view_mode(true);
    RCloud.UI.session_pane.init(); // really should be error logger which detects if there is a pane
    RCloud.UI.init();

    RCloud.session.init(true).then(function() {
        return Promise.all([
            RCloud.UI.navbar.load(),
            (rcloud.config ?
             rcloud.config.get_user_option('show-cell-numbers') :
             Promise.resolve(true)).then(function(whether) {
                 if(whether === null) whether = true;
                 return shell.notebook.controller.show_cell_numbers(whether);
             })
        ]);
    }).then(function() {
        // we don't want to load_everything, it's not even sufficient with lazy notebook
        // loading, but keep it for now to keep the circus rolling 
        return Promise.all([shell.init(), editor.load_everything()]).then(function() {
            RCloud.UI.advanced_menu.init();
            RCloud.UI.menus.load();
            return RCloud.UI.discovery_page.init();
        });
    });
}
